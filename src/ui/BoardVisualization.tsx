import React, { useEffect, useRef, useState } from 'react';
import { Board, Hex, GlobalVertex, GlobalEdge, HEX_EDGES, BuildingType, Building } from '@/models/board.models';
import { 
  initializeBoard, 
  getPerimeterEdges, 
  getPerimeterVertices,
  getPortableVertices,
  findValidHexPositions,
  addHexToBoard
} from '@/models/board.initialization';
import { Resource } from '@/types';

const RESOURCE_COLORS: Record<Resource, string> = {
  [Resource.Wood]: '#2D5016',  // Deep forest green
  [Resource.Brick]: '#B8584D',  // Terracotta red
  [Resource.Sheep]: '#83C55B',  // Pasture green
  [Resource.Wheat]: '#F4C842',  // Golden wheat
  [Resource.Ore]: '#7A7A7A'     // Mountain gray
};

const PLAYER_COLORS = ['#FF0000', '#0000FF', '#FFA500', '#FFFFFF'];

// Helper function to adjust color brightness
function adjustBrightness(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

// Get number of probability dots for a number token
// Note: 7 is not included - it's reserved for the robber
function getProbabilityDots(number: number): number {
  const dotMap: Record<number, number> = {
    2: 1,
    3: 2,
    4: 3,
    5: 4,
    6: 5,
    8: 5,
    9: 4,
    10: 3,
    11: 2,
    12: 1
  };
  return dotMap[number] || 0;
}

interface ViewOptions {
  showVertices: boolean; // Show all vertices
  showHexNumbers: boolean; // Show hex index numbers
  showPortable: boolean; // Show portable vertices (between 2 hexes on perimeter)
  boardSize: number; // Number of rings from center (2-5)
}

interface GameLogEntry {
  id: number;
  timestamp: Date;
  message: string;
  type: 'action' | 'discovery' | 'system' | 'command';
}

interface GameState {
  currentPlayer: number;
  turn: number;
  phase: 'setup' | 'play' | 'end';
}

export const BoardVisualization: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [board, setBoard] = useState<Board | null>(null);
  const [selectedHex, setSelectedHex] = useState<number | null>(null);
  const [selectedVertex, setSelectedVertex] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const [viewOptions, setViewOptions] = useState<ViewOptions>({
    showVertices: true,
    showHexNumbers: true,
    showPortable: true,
    boardSize: 2  // Start with 2 rings for discovery gameplay
  });
  const [gameLog, setGameLog] = useState<GameLogEntry[]>([]);
  const [commandInput, setCommandInput] = useState('');
  const [gameState, setGameState] = useState<GameState>({
    currentPlayer: 1,
    turn: 1,
    phase: 'setup'
  });
  const logIdRef = useRef(0);
  
  // Pan state for dragging
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastPan, setLastPan] = useState({ x: 0, y: 0 });
  
  // Fixed large canvas size for stability
  const CANVAS_WIDTH = 2000;
  const CANVAS_HEIGHT = 2000;
  
  const getHexRadius = () => {
    return 70; // Always return constant hex radius
  };
  
  // Add log entry
  const addLogEntry = (message: string, type: GameLogEntry['type'] = 'action') => {
    setGameLog(prev => [...prev, {
      id: logIdRef.current++,
      timestamp: new Date(),
      message,
      type
    }]);
  };
  
  // Process command
  const processCommand = (command: string) => {
    if (!command.trim()) return;
    
    // Add command to log
    addLogEntry(`> ${command}`, 'command');
    
    // Parse and execute command
    const parts = command.toLowerCase().split(' ');
    const cmd = parts[0];
    
    switch (cmd) {
      case 'build': {
        if (parts[1] === 'settlement' && selectedVertex) {
          handleBuildSettlement(selectedVertex);
        } else if (parts[1] === 'city' && selectedVertex) {
          handleBuildCity(selectedVertex);
        } else {
          addLogEntry('Usage: build settlement/city (select a vertex first)', 'system');
        }
        break;
      }
      case 'help':
        addLogEntry('Available commands: build settlement/city, roll, trade, end', 'system');
        break;
      case 'roll':
        const roll = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
        addLogEntry(`Rolled: ${roll}`, 'action');
        break;
      case 'end':
        addLogEntry(`Player ${gameState.currentPlayer} ended turn`, 'action');
        setGameState(prev => ({
          ...prev,
          currentPlayer: (prev.currentPlayer % 4) + 1,
          turn: prev.turn + 1
        }));
        break;
      }
      default: {
        addLogEntry(`Unknown command: ${cmd}`, 'system');
      }
    }
    
    setCommandInput('');
  };
  
  // Handle building on perimeter vertex
  const handleBuildSettlement = (vertexId: string) => {
    if (!board) return;
    
    // Check if vertex already has a building
    if (board.buildings.has(vertexId)) {
      addLogEntry('This vertex already has a building!', 'system');
      return;
    }
    
    // Create the settlement
    const building: Building = {
      type: BuildingType.Settlement,
      player: gameState.currentPlayer,
      vertexId
    };
    
    // Update board state
    const newBuildings = new Map(board.buildings);
    newBuildings.set(vertexId, building);
    setBoard({ ...board, buildings: newBuildings });
    
    // Check if on perimeter
    const perimeterVertices = new Set(getPerimeterVertices(board));
    if (perimeterVertices.has(vertexId)) {
      addLogEntry(`Player ${gameState.currentPlayer} built settlement on perimeter vertex ${vertexId} - discovering new hex!`, 'discovery');
      discoverNewHex(vertexId);
    } else {
      addLogEntry(`Player ${gameState.currentPlayer} built settlement on vertex ${vertexId}`, 'action');
    }
  };
  
  const handleBuildCity = (vertexId: string) => {
    if (!board) return;
    
    // Check if vertex has a settlement that can be upgraded
    const existingBuilding = board.buildings.get(vertexId);
    if (!existingBuilding) {
      addLogEntry('You must build a settlement first!', 'system');
      return;
    }
    if (existingBuilding.type === BuildingType.City) {
      addLogEntry('This vertex already has a city!', 'system');
      return;
    }
    if (existingBuilding.player !== gameState.currentPlayer) {
      addLogEntry('You can only upgrade your own settlements!', 'system');
      return;
    }
    
    // Upgrade to city
    const city: Building = {
      type: BuildingType.City,
      player: gameState.currentPlayer,
      vertexId
    };
    
    // Update board state
    const newBuildings = new Map(board.buildings);
    newBuildings.set(vertexId, city);
    setBoard({ ...board, buildings: newBuildings });
    
    // Check if on perimeter
    const perimeterVertices = new Set(getPerimeterVertices(board));
    if (perimeterVertices.has(vertexId)) {
      addLogEntry(`Player ${gameState.currentPlayer} built city on perimeter vertex ${vertexId} - discovering new hex!`, 'discovery');
      discoverNewHex(vertexId);
    } else {
      addLogEntry(`Player ${gameState.currentPlayer} built city on vertex ${vertexId}`, 'action');
    }
  };
  
  // Discover a new hex adjacent to perimeter vertex
  const discoverNewHex = (vertexId: string) => {
    if (!board) return;
    
    const validPositions = findValidHexPositions(board, vertexId);
    if (validPositions.length === 0) {
      addLogEntry('No valid positions for new hex!', 'system');
      return;
    }
    
    // Pick a random valid position
    const position = validPositions[Math.floor(Math.random() * validPositions.length)];
    
    // Get current canvas settings
    const hexRadius = getHexRadius();
    const center = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 };
    
    // Add the new hex
    const updatedBoard = addHexToBoard(board, position, hexRadius, center.x, center.y);
    setBoard(updatedBoard);
    
    const newHex = updatedBoard.hexes[updatedBoard.hexes.length - 1];
    addLogEntry(
      `New hex discovered at (${position.q},${position.r})! Resource: ${newHex.resource}, Number: ${newHex.numberToken}`, 
      'discovery'
    );
  };

  // Initialize board only when board size changes
  useEffect(() => {
    const hexRadius = getHexRadius();
    const center = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 };
    const newBoard = initializeBoard(viewOptions.boardSize, hexRadius, center);
    setBoard(newBoard);
    
    // Reset pan
    setPan({ x: 0, y: 0 });
    
    // Add initial log entry
    addLogEntry(`Board initialized with ${newBoard.hexes.length} hexes`, 'system');
    
    // Log board data
    console.log(`Board initialized with size ${viewOptions.boardSize}:`, newBoard);
    console.log('Total hexes:', newBoard.hexes.length);
    console.log('Global vertices:', newBoard.globalVertices.size);
    console.log('Global edges:', newBoard.globalEdges.size);
    console.log('Perimeter edges:', getPerimeterEdges(newBoard).length);
    console.log('Perimeter vertices:', getPerimeterVertices(newBoard).length);
    console.log('Portable vertices:', getPortableVertices(newBoard).length);
  }, [viewOptions.boardSize]);

  useEffect(() => {
    if (!board || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    
    // Clear canvas with ocean-themed gradient
    const gradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
    );
    gradient.addColorStop(0, '#2c4d6d');
    gradient.addColorStop(0.7, '#1e3a5f');
    gradient.addColorStop(1, '#0a1929');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Save context state
    ctx.save();
    
    // Apply pan transformation
    ctx.translate(pan.x, pan.y);
    
    // Enable anti-aliasing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Draw hexes first (filled shapes)
    board.hexes.forEach(hex => drawHex(ctx, hex, viewOptions));
    
    // Draw edges on top of hexes
    drawGlobalEdges(ctx);
    
    // Draw vertices on top
    if (viewOptions.showVertices) {
      // Draw non-selected hexes first
      board.hexes.forEach(hex => {
        if (hex.index !== selectedHex) {
          drawVertices(ctx, hex);
        }
      });
      // Draw selected hex last so its vertices are on top
      if (selectedHex !== null) {
        const selectedHexObj = board.hexes.find(h => h.index === selectedHex);
        if (selectedHexObj) {
          drawVertices(ctx, selectedHexObj);
        }
      }
    }
    
    // Draw buildings on top of everything
    drawBuildings(ctx);
    
    // Restore context state
    ctx.restore();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board, selectedHex, selectedVertex, selectedEdge, viewOptions, pan]);

  const drawHex = (ctx: CanvasRenderingContext2D, hex: Hex, viewOptions: ViewOptions) => {
    const { x, y } = hex.position;
    
    // Draw hexagon shape
    ctx.beginPath();
    hex.vertices.forEach((vertex, i) => {
      if (i === 0) ctx.moveTo(vertex.position.x, vertex.position.y);
      else ctx.lineTo(vertex.position.x, vertex.position.y);
    });
    ctx.closePath();
    
    // Apply shadow effect - enhanced for selected hex
    if (selectedHex === hex.index) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    } else {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
    }
    
    // Fill with resource color - brighten if selected
    const isSelected = selectedHex === hex.index;
    const brightnessAdjust = isSelected ? 40 : 0;
    
    if (hex.resource) {
      const baseColor = RESOURCE_COLORS[hex.resource];
      ctx.fillStyle = adjustBrightness(baseColor, brightnessAdjust);
    } else {
      // Desert color
      const desertColor = '#E5D6C3';
      ctx.fillStyle = adjustBrightness(desertColor, brightnessAdjust);
    }
    ctx.fill();
    
    // Reset shadow for border
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Draw subtle border for all hexes
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Draw hex index if enabled
    if (viewOptions.showHexNumbers) {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '600 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 2;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      ctx.fillText(hex.index.toString(), x, y - 25);
      ctx.restore();
    }
    
    // Skip resource abbreviation for cleaner look
    
    // Draw number token
    if (hex.numberToken) {
      // Draw number token with elegant design
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      ctx.beginPath();
      ctx.arc(x, y + 15, 22, 0, 2 * Math.PI);
      
      // Gradient for token
      const tokenGradient = ctx.createRadialGradient(x - 5, y + 10, 0, x, y + 15, 22);
      tokenGradient.addColorStop(0, '#FFFEF7');
      tokenGradient.addColorStop(0.6, '#FFF8DC');
      tokenGradient.addColorStop(1, '#E8D4B0');
      ctx.fillStyle = tokenGradient;
      ctx.fill();
      
      ctx.strokeStyle = '#8B6F47';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
      
      // Draw number - red for 6 and 8, probability-based shading for others
      const isRed = hex.numberToken === 6 || hex.numberToken === 8;
      const dots = getProbabilityDots(hex.numberToken);
      
      // Calculate color based on probability
      let textColor: string;
      if (isRed) {
        textColor = '#C62828'; // Red for 6 and 8
      } else {
        // Map dots (1-4) to grayscale values
        // 1 dot (2,12) = lightest, 4 dots (5,9) = darkest
        const grayValue = Math.round(140 - (dots * 30)); // Range from 140 (light) to 20 (dark)
        textColor = `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
      }
      
      ctx.save();
      ctx.fillStyle = textColor;
      ctx.font = '700 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 1;
      ctx.shadowOffsetY = 1;
      ctx.fillText(hex.numberToken.toString(), x, y + 15);
      ctx.restore();
      
      // Remove probability dots for cleaner look
    }
    
    // Draw robber figurine
    if (hex.hasRobber) {
      ctx.save();
      
      // Robber shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 4;
      
      // Draw robber body (cone shape)
      const robberHeight = 40;
      const robberBaseWidth = 25;
      const robberTopWidth = 15;
      
      // Body gradient
      const bodyGradient = ctx.createLinearGradient(
        x - robberTopWidth/2, y - robberHeight/2,
        x + robberTopWidth/2, y + robberHeight/2
      );
      bodyGradient.addColorStop(0, '#3A3A3A');
      bodyGradient.addColorStop(0.3, '#2C2C2C');
      bodyGradient.addColorStop(0.7, '#1A1A1A');
      bodyGradient.addColorStop(1, '#000000');
      
      // Draw body
      ctx.beginPath();
      ctx.moveTo(x - robberBaseWidth/2, y + robberHeight/2);
      ctx.lineTo(x - robberTopWidth/2, y - robberHeight/3);
      ctx.lineTo(x - robberTopWidth/2, y - robberHeight/2);
      ctx.lineTo(x + robberTopWidth/2, y - robberHeight/2);
      ctx.lineTo(x + robberTopWidth/2, y - robberHeight/3);
      ctx.lineTo(x + robberBaseWidth/2, y + robberHeight/2);
      ctx.closePath();
      ctx.fillStyle = bodyGradient;
      ctx.fill();
      
      // Body outline
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      
      ctx.restore();
      
      // Draw head (no shadow)
      ctx.save();
      const headRadius = 12;
      const headY = y - robberHeight/2 - headRadius/2;
      
      // Head gradient
      const headGradient = ctx.createRadialGradient(
        x - 3, headY - 3, 0,
        x, headY, headRadius
      );
      headGradient.addColorStop(0, '#4A4A4A');
      headGradient.addColorStop(0.7, '#2C2C2C');
      headGradient.addColorStop(1, '#1A1A1A');
      
      ctx.beginPath();
      ctx.arc(x, headY, headRadius, 0, Math.PI * 2);
      ctx.fillStyle = headGradient;
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      
      // Add highlight on body for 3D effect
      ctx.beginPath();
      ctx.moveTo(x - robberTopWidth/3, y - robberHeight/3);
      ctx.lineTo(x - robberTopWidth/4, y - robberHeight/2.5);
      ctx.lineTo(x - robberBaseWidth/3, y + robberHeight/3);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      
      // Add small highlight on head
      ctx.beginPath();
      ctx.arc(x - 3, headY - 3, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fill();
      
      ctx.restore();
    }
  };

  const drawVertices = (ctx: CanvasRenderingContext2D, hex: Hex) => {
    hex.vertices.forEach((vertex, index) => {
      const { x, y } = vertex.position;
      
      // Find global vertex
      let globalVertex: GlobalVertex | null = null;
      let globalId = '';
      
      if (board) {
        for (const [id, gv] of board.globalVertices) {
          if (gv.hexes.some(h => h.hexIndex === hex.index && h.vertexIndex === index)) {
            globalVertex = gv;
            globalId = id;
            break;
          }
        }
      }
      
      // Determine if this is a portable vertex
      const isPortable = viewOptions.showPortable && 
        board && getPortableVertices(board).includes(globalId);
      
      // Only draw vertex circles for selected hex or if showing portable
      const isSelectedHex = selectedHex === hex.index;
      const shouldDrawCircle = isSelectedHex || isPortable || selectedVertex === globalId;
      
      if (shouldDrawCircle) {
        // Check if this is the selected portable vertex
        const isSelectedPortable = selectedVertex === globalId && isPortable;
        
        // Draw vertex circle
        ctx.beginPath();
        const radius = isSelectedPortable ? 15 : 8; // Larger radius for selected portable
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        
        if (isSelectedPortable) {
          ctx.fillStyle = '#00FF00'; // Bright green for selected portable
        } else if (selectedVertex === globalId) {
          ctx.fillStyle = '#0080FF'; // Bright blue for selected vertex
        } else if (isPortable) {
          ctx.fillStyle = '#00FF00'; // Green for portable vertices
        } else {
          ctx.fillStyle = '#FFF';
        }
        ctx.fill();
        
        ctx.strokeStyle = isSelectedPortable ? '#00CC00' : '#333';
        ctx.lineWidth = isSelectedPortable ? 3 : 1;
        ctx.stroke();
        
        // Draw labels
        if (isSelectedPortable) {
          // Draw "P" label for selected portable vertex
          ctx.fillStyle = '#FFF';
          ctx.font = 'bold 16px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('P', x, y);
        } else if (isSelectedHex && viewOptions.showVertices) {
          // Draw vertex number for selected hex
          ctx.fillStyle = '#000';
          ctx.font = 'bold 10px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(index.toString(), x, y);
        }
      }
    });
  };

  const drawGlobalEdges = (ctx: CanvasRenderingContext2D) => {
    if (!board) return;
    
    const perimeterEdges = new Set(getPerimeterEdges(board));
    
    // Draw roads first
    board.roads.forEach((player, edgeId) => {
      const edge = board.globalEdges.get(edgeId);
      if (!edge) return;
      
      const v1 = board.globalVertices.get(edge.vertices[0]);
      const v2 = board.globalVertices.get(edge.vertices[1]);
      if (!v1 || !v2) return;
      
      ctx.save();
      
      // Draw road shadow
      ctx.beginPath();
      ctx.moveTo(v1.position.x, v1.position.y);
      ctx.lineTo(v2.position.x, v2.position.y);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 3;
      ctx.shadowOffsetY = 2;
      ctx.stroke();
      
      // Draw road
      ctx.beginPath();
      ctx.moveTo(v1.position.x, v1.position.y);
      ctx.lineTo(v2.position.x, v2.position.y);
      ctx.strokeStyle = PLAYER_COLORS[player - 1];
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.shadowBlur = 0;
      ctx.stroke();
      
      // Add highlight
      const dx = v2.position.x - v1.position.x;
      const dy = v2.position.y - v1.position.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      const nx = -dy / len * 2;
      const ny = dx / len * 2;
      
      ctx.beginPath();
      ctx.moveTo(v1.position.x + nx, v1.position.y + ny);
      ctx.lineTo(v2.position.x + nx, v2.position.y + ny);
      ctx.strokeStyle = adjustBrightness(PLAYER_COLORS[player - 1], 40);
      ctx.lineWidth = 1.5;
      ctx.stroke();
      
      ctx.restore();
    });
    
    // Draw edges
    board.globalEdges.forEach((edge, id) => {
      // Skip if this edge is a road
      if (board.roads.has(id)) return;
      
      const v1 = board.globalVertices.get(edge.vertices[0]);
      const v2 = board.globalVertices.get(edge.vertices[1]);
      
      if (!v1 || !v2) return;
      
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(v1.position.x, v1.position.y);
      ctx.lineTo(v2.position.x, v2.position.y);
      ctx.lineCap = 'round';
      
      if (selectedEdge === id) {
        // Selected edge with glow
        ctx.shadowColor = '#00BFFF';
        ctx.shadowBlur = 8;
        ctx.strokeStyle = '#00BFFF';
        ctx.lineWidth = 4;
        ctx.stroke();
        
        // Core line
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#66D9FF';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (viewOptions.showPortable && perimeterEdges.has(id)) {
        ctx.strokeStyle = 'rgba(150, 150, 150, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else {
        ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();
    });
  };

  const drawBuildings = (ctx: CanvasRenderingContext2D) => {
    if (!board) return;
    
    board.buildings.forEach((building, vertexId) => {
      const vertex = board.globalVertices.get(vertexId);
      if (!vertex) return;
      
      const { x, y } = vertex.position;
      const playerColor = PLAYER_COLORS[building.player - 1];
      
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      if (building.type === BuildingType.Settlement) {
        // Draw settlement with gradient
        const size = 12;
        const gradient = ctx.createLinearGradient(
          x, y - size,
          x, y + 8
        );
        gradient.addColorStop(0, adjustBrightness(playerColor, 30));
        gradient.addColorStop(0.5, playerColor);
        gradient.addColorStop(1, adjustBrightness(playerColor, -30));
        
        ctx.beginPath();
        ctx.moveTo(x, y - size);
        ctx.lineTo(x + 10, y - 4);
        ctx.lineTo(x + 10, y + 8);
        ctx.lineTo(x - 10, y + 8);
        ctx.lineTo(x - 10, y - 4);
        ctx.closePath();
        
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.stroke();
        
        // Add roof highlight
        ctx.beginPath();
        ctx.moveTo(x - 8, y - 3);
        ctx.lineTo(x, y - 10);
        ctx.lineTo(x + 8, y - 3);
        ctx.strokeStyle = adjustBrightness(playerColor, 50);
        ctx.lineWidth = 1;
        ctx.stroke();
      } else if (building.type === BuildingType.City) {
        // Draw city with gradient
        const size = 16;
        const gradient = ctx.createLinearGradient(
          x, y - size,
          x, y + 10
        );
        gradient.addColorStop(0, adjustBrightness(playerColor, 30));
        gradient.addColorStop(0.5, playerColor);
        gradient.addColorStop(1, adjustBrightness(playerColor, -30));
        
        ctx.beginPath();
        ctx.moveTo(x - 12, y + 10);
        ctx.lineTo(x - 12, y - 2);
        ctx.lineTo(x - 8, y - 6);
        ctx.lineTo(x - 8, y - 10);
        ctx.lineTo(x - 4, y - 10);
        ctx.lineTo(x - 4, y - 6);
        ctx.lineTo(x, y - 10);
        ctx.lineTo(x, y - 6);
        ctx.lineTo(x + 4, y - 10);
        ctx.lineTo(x + 4, y - 6);
        ctx.lineTo(x + 8, y - 10);
        ctx.lineTo(x + 8, y - 6);
        ctx.lineTo(x + 12, y - 2);
        ctx.lineTo(x + 12, y + 10);
        ctx.closePath();
        
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.stroke();
        
        // Add tower highlights
        ctx.strokeStyle = adjustBrightness(playerColor, 50);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x - 6, y - 8);
        ctx.lineTo(x - 6, y - 4);
        ctx.moveTo(x + 6, y - 8);
        ctx.lineTo(x + 6, y - 4);
        ctx.stroke();
      }
      ctx.restore();
    });
  };


  // Mouse event handlers for pan
  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: event.clientX, y: event.clientY });
    setLastPan({ ...pan });
  };
  
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    
    const dx = event.clientX - dragStart.x;
    const dy = event.clientY - dragStart.y;
    setPan({
      x: lastPan.x + dx,
      y: lastPan.y + dy
    });
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!board || !canvasRef.current || isDragging) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const canvasX = event.clientX - rect.left;
    const canvasY = event.clientY - rect.top;
    
    // Convert canvas coordinates to world coordinates
    const x = canvasX - pan.x;
    const y = canvasY - pan.y;
    
    // Check for vertex click first (smaller target)
    for (const [id, vertex] of board.globalVertices) {
      const dx = x - vertex.position.x;
      const dy = y - vertex.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 10) {
        setSelectedVertex(id);
        setSelectedHex(null);
        setSelectedEdge(null);
        return;
      }
    }
    
    // Check for edge click (calculate distance from point to line segment)
    for (const [id, edge] of board.globalEdges) {
      const v1 = board.globalVertices.get(edge.vertices[0]);
      const v2 = board.globalVertices.get(edge.vertices[1]);
      if (!v1 || !v2) continue;
      
      // Calculate distance from point to line segment
      const A = x - v1.position.x;
      const B = y - v1.position.y;
      const C = v2.position.x - v1.position.x;
      const D = v2.position.y - v1.position.y;
      
      const dot = A * C + B * D;
      const lenSq = C * C + D * D;
      let param = -1;
      
      if (lenSq !== 0) param = dot / lenSq;
      
      let xx, yy;
      
      if (param < 0) {
        xx = v1.position.x;
        yy = v1.position.y;
      } else if (param > 1) {
        xx = v2.position.x;
        yy = v2.position.y;
      } else {
        xx = v1.position.x + param * C;
        yy = v1.position.y + param * D;
      }
      
      const dx = x - xx;
      const dy = y - yy;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 8) {
        setSelectedEdge(id);
        setSelectedHex(null);
        setSelectedVertex(null);
        return;
      }
    }
    
    // Then check for hex click
    for (const hex of board.hexes) {
      const dx = x - hex.position.x;
      const dy = y - hex.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 50) {
        setSelectedHex(hex.index);
        setSelectedVertex(null);
        setSelectedEdge(null);
        return;
      }
    }
    
    setSelectedHex(null);
    setSelectedVertex(null);
    setSelectedEdge(null);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f0f0f0' }}>
      {/* Left Sidebar */}
      <div style={{ 
        width: '700px', 
        backgroundColor: '#fff', 
        borderRight: '2px solid #333',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh'
      }}>
        {/* Game Info */}
        <div style={{ padding: '20px', borderBottom: '1px solid #ddd' }}>
          <h3 style={{ margin: '0 0 10px 0' }}>CATAMM - Expandable Board</h3>
          <div style={{ fontSize: '14px' }}>
            <p>Player {gameState.currentPlayer}&apos;s Turn</p>
            <p>Turn: {gameState.turn}</p>
            <p>Phase: {gameState.phase}</p>
          </div>
        </div>
        
        {/* Selection Info */}
        <div style={{ 
          padding: '20px', 
          borderBottom: '1px solid #ddd',
          backgroundColor: '#f8f8f8',
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          <h4 style={{ margin: '0 0 10px 0' }}>Selection Info</h4>
          
          {(selectedHex === null && selectedVertex === null && selectedEdge === null) && (
            <p style={{ color: '#666', fontSize: '12px', margin: 0 }}>Click on hexes, vertices, or edges to view details</p>
          )}
          
          {selectedHex !== null && board && (
            <div style={{ fontSize: '12px' }}>
              <h5 style={{ margin: '0 0 10px 0' }}>Hex {selectedHex}</h5>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div><strong>Resource:</strong> {board.hexes[selectedHex].resource || 'Desert'}</div>
                <div><strong>Number:</strong> {board.hexes[selectedHex].numberToken || 'None'}</div>
              </div>
              <div><strong>Neighbors:</strong> {board.hexes[selectedHex].neighbors.join(', ')}</div>
            </div>
          )}
          
          {selectedVertex !== null && board && (
            <div style={{ fontSize: '12px' }}>
              <h5 style={{ margin: '0 0 10px 0' }}>Vertex {selectedVertex}</h5>
              {(() => {
                const vertex = board.globalVertices.get(selectedVertex);
                if (!vertex) return null;
                const isPortable = getPortableVertices(board).includes(selectedVertex);
                
                return (
                  <>
                    <div style={{ marginBottom: '5px' }}>
                      <strong>Position:</strong> ({vertex.position.x.toFixed(0)}, {vertex.position.y.toFixed(0)})
                      {isPortable && <span style={{ marginLeft: '10px', color: '#00FF00', fontWeight: 'bold' }}>PORTABLE</span>}
                    </div>
                    <div>
                      <strong>Shared by hexes:</strong> {vertex.hexes.map(h => `Hex ${h.hexIndex}`).join(', ')}
                    </div>
                  </>
                );
              })()}
            </div>
          )}
          
          {selectedEdge !== null && board && (
            <div style={{ fontSize: '12px' }}>
              <h5 style={{ margin: '0 0 10px 0' }}>Edge {selectedEdge}</h5>
              {(() => {
                const edge = board.globalEdges.get(selectedEdge);
                if (!edge) return null;
                const isPerimeter = getPerimeterEdges(board).includes(selectedEdge);
                
                return (
                  <>
                    <div style={{ marginBottom: '5px' }}>
                      <strong>Connects:</strong> {edge.vertices.join(' ↔ ')}
                      {isPerimeter && <span style={{ marginLeft: '10px', color: '#FF6B6B', fontWeight: 'bold' }}>PERIMETER</span>}
                    </div>
                    <div>
                      <strong>Shared by:</strong> {edge.hexes.map(h => `Hex ${h.hexIndex}`).join(', ')}
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
        
        {/* Game Log */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto',
          padding: '10px',
          backgroundColor: '#fafafa',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h4 style={{ margin: '0 0 10px 0' }}>Game Log</h4>
          <div style={{ 
            fontSize: '12px', 
            fontFamily: 'monospace',
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column-reverse'
          }}>
            <div>
              {gameLog.length === 0 && (
                <div style={{ color: '#666' }}>Game started. Type 'help' for commands.</div>
              )}
              {gameLog.map(entry => (
                <div key={entry.id} style={{
                  marginBottom: '5px',
                  color: entry.type === 'command' ? '#0066cc' :
                         entry.type === 'discovery' ? '#cc6600' :
                         entry.type === 'system' ? '#666' : '#000'
                }}>
                  [{entry.timestamp.toLocaleTimeString()}] {entry.message}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Command Input */}
        <div style={{ padding: '10px', borderTop: '1px solid #ddd' }}>
          <form onSubmit={(e) => { e.preventDefault(); processCommand(commandInput); }}>
            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder="Enter command..."
              style={{
                width: '100%',
                padding: '8px',
                fontSize: '14px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </form>
          <div style={{ marginTop: '5px', fontSize: '11px', color: '#666' }}>
            Commands: build settlement/city, roll, trade, end
          </div>
        </div>
      </div>
      
      {/* Main Board Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="controls" style={{ padding: '20px', textAlign: 'center', backgroundColor: '#fff' }}>
          <div style={{ marginTop: '10px' }}>
            <label style={{ marginRight: '20px' }}>
              <input
                type="checkbox"
                checked={viewOptions.showVertices}
                onChange={(e) => setViewOptions({...viewOptions, showVertices: e.target.checked})}
              />
              Show Vertices
            </label>
            <label style={{ marginRight: '20px' }}>
              <input
                type="checkbox"
                checked={viewOptions.showHexNumbers}
                onChange={(e) => setViewOptions({...viewOptions, showHexNumbers: e.target.checked})}
              />
              Show Hex Numbers
            </label>
            <label style={{ marginRight: '20px' }}>
              <input
                type="checkbox"
                checked={viewOptions.showPortable}
                onChange={(e) => setViewOptions({...viewOptions, showPortable: e.target.checked})}
              />
              Show Portable Vertices
            </label>
            <label style={{ marginRight: '20px' }}>
              Board Size: 
              <select 
                value={viewOptions.boardSize} 
                onChange={(e) => setViewOptions({...viewOptions, boardSize: parseInt(e.target.value)})}
                style={{ marginLeft: '10px' }}
              >
                <option value={2}>2 rings (19 hexes)</option>
                <option value={3}>3 rings (37 hexes)</option>
                <option value={4}>4 rings (61 hexes)</option>
                <option value={5}>5 rings (91 hexes)</option>
              </select>
            </label>
            <button onClick={() => {
              const hexRadius = getHexRadius();
              const center = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 };
              const newBoard = initializeBoard(viewOptions.boardSize, hexRadius, center);
              setBoard(newBoard);
              setPan({ x: 0, y: 0 });
              addLogEntry('New board generated', 'system');
            }} style={{ marginLeft: '20px' }}>
              New Board
            </button>
            <button onClick={() => setPan({ x: 0, y: 0 })} style={{ marginLeft: '10px' }}>
              Center View
            </button>
            <span style={{ marginLeft: '20px', fontSize: '12px', color: '#666' }}>
              Drag to pan around the board
            </span>
          </div>
          {/* Board Statistics */}
          {board && (
            <div style={{ 
              marginTop: '15px', 
              padding: '15px', 
              backgroundColor: '#f5f5f5', 
              borderRadius: '4px',
              display: 'inline-block'
            }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Board Statistics</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', fontSize: '12px' }}>
                <div>
                  <strong>Hexes:</strong> {board.hexes.length}
                </div>
                <div>
                  <strong>Vertices:</strong> {board.globalVertices.size}
                </div>
                <div>
                  <strong>Portable:</strong> {getPortableVertices(board).length}
                </div>
                <div>
                  <strong>Edges:</strong> {board.globalEdges.size}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            onClick={handleCanvasClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
              backgroundColor: '#fff',
              cursor: isDragging ? 'grabbing' : 'grab',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              borderRadius: '4px'
            }}
          />
        </div>
      </div>
    </div>
  );
};

