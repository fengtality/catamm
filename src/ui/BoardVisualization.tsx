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
  [Resource.Wood]: '#8B4513',
  [Resource.Brick]: '#B22222',
  [Resource.Sheep]: '#90EE90',
  [Resource.Wheat]: '#FFD700',
  [Resource.Ore]: '#696969'
};

const PLAYER_COLORS = ['#FF0000', '#0000FF', '#FFA500', '#FFFFFF'];

// Get number of probability dots for a number token
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
  showVertexNumbers: boolean;
  showPerimeter: boolean;
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
  const [viewOptions, setViewOptions] = useState<ViewOptions>({
    showVertexNumbers: true,
    showPerimeter: true,
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
  
  // Calculate canvas size and hex size based on board size
  const getCanvasSize = (boardSize: number) => {
    const baseSize = 800;
    const sizeMultiplier = 1 + (boardSize - 2) * 0.3;
    return Math.round(baseSize * sizeMultiplier);
  };
  
  const getHexRadius = (boardSize: number) => {
    const baseRadius = 70;
    const radiusMultiplier = Math.max(0.4, 1 - (boardSize - 2) * 0.2);
    return Math.round(baseRadius * radiusMultiplier);
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
      case 'build':
        if (parts[1] === 'settlement' && selectedVertex) {
          handleBuildSettlement(selectedVertex);
        } else if (parts[1] === 'city' && selectedVertex) {
          handleBuildCity(selectedVertex);
        } else {
          addLogEntry('Usage: build settlement/city (select a vertex first)', 'system');
        }
        break;
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
      default:
        addLogEntry(`Unknown command: ${cmd}`, 'system');
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
    const hexRadius = getHexRadius(viewOptions.boardSize);
    const canvasSize = getCanvasSize(viewOptions.boardSize);
    const center = { x: canvasSize / 2, y: canvasSize / 2 };
    
    // Add the new hex
    const updatedBoard = addHexToBoard(board, position, hexRadius, center.x, center.y);
    setBoard(updatedBoard);
    
    const newHex = updatedBoard.hexes[updatedBoard.hexes.length - 1];
    addLogEntry(
      `New hex discovered at (${position.q},${position.r})! Resource: ${newHex.resource}, Number: ${newHex.numberToken}`, 
      'discovery'
    );
  };

  useEffect(() => {
    const hexRadius = getHexRadius(viewOptions.boardSize);
    const canvasSize = getCanvasSize(viewOptions.boardSize);
    const center = { x: canvasSize / 2, y: canvasSize / 2 };
    const newBoard = initializeBoard(viewOptions.boardSize, hexRadius, center);
    setBoard(newBoard);
    
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
    
    // Clear canvas
    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw edges first (so they appear under hexes)
    drawGlobalEdges(ctx);
    
    // Draw hexes
    board.hexes.forEach(hex => drawHex(ctx, hex));
    
    // Draw vertices on top
    if (viewOptions.showVertexNumbers) {
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
    
    // Draw info panel
    drawInfoPanel(ctx);
    
  }, [board, selectedHex, selectedVertex, viewOptions]);

  const drawHex = (ctx: CanvasRenderingContext2D, hex: Hex) => {
    const { x, y } = hex.position;
    
    // Draw hexagon shape
    ctx.beginPath();
    hex.vertices.forEach((vertex, i) => {
      if (i === 0) ctx.moveTo(vertex.position.x, vertex.position.y);
      else ctx.lineTo(vertex.position.x, vertex.position.y);
    });
    ctx.closePath();
    
    // Fill with resource color or gray for desert
    if (hex.resource) {
      ctx.fillStyle = RESOURCE_COLORS[hex.resource];
    } else {
      ctx.fillStyle = '#DEB887'; // Desert color
    }
    ctx.fill();
    
    // Highlight if selected
    if (selectedHex === hex.index) {
      ctx.strokeStyle = '#FF0000';
      ctx.lineWidth = 4;
    } else {
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
    }
    ctx.stroke();
    
    // Draw hex index
    ctx.fillStyle = '#000';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(hex.index.toString(), x, y - 15);
    
    // Draw resource abbreviation
    if (hex.resource) {
      ctx.font = '14px Arial';
      ctx.fillStyle = '#333';
      ctx.fillText(hex.resource.substring(0, 2), x, y + 5);
    }
    
    // Draw number token
    if (hex.numberToken) {
      ctx.beginPath();
      ctx.arc(x, y + 25, 15, 0, 2 * Math.PI);
      ctx.fillStyle = '#FFF8DC';
      ctx.fill();
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw number with red for 6 and 8
      ctx.fillStyle = hex.numberToken === 6 || hex.numberToken === 8 ? '#FF0000' : '#000';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(hex.numberToken.toString(), x, y + 25);
      
      // Draw probability dots
      const dots = getProbabilityDots(hex.numberToken);
      if (dots > 0) {
        ctx.font = '8px Arial';
        ctx.fillStyle = '#666';
        const dotString = '•'.repeat(dots);
        ctx.fillText(dotString, x, y + 38);
      }
    }
    
    // Draw robber
    if (hex.hasRobber) {
      ctx.fillStyle = '#000';
      ctx.font = '20px Arial';
      ctx.fillText('🏴‍☠️', x - 10, y - 30);
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
      
      // Determine if this is a perimeter vertex
      const isPerimeter = viewOptions.showPerimeter && 
        board && getPerimeterVertices(board).includes(globalId);
      
      // Only draw vertex circles for selected hex or if showing perimeter
      const isSelectedHex = selectedHex === hex.index;
      const shouldDrawCircle = isSelectedHex || isPerimeter || selectedVertex === globalId;
      
      if (shouldDrawCircle) {
        // Draw vertex circle
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, 2 * Math.PI);
        
        if (selectedVertex === globalId) {
          ctx.fillStyle = '#FFD700';
        } else if (isPerimeter) {
          ctx.fillStyle = '#FF6B6B';
        } else {
          ctx.fillStyle = '#FFF';
        }
        ctx.fill();
        
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Only draw vertex number/ID for selected hex
        if (isSelectedHex) {
          ctx.fillStyle = '#000';
          ctx.font = 'bold 10px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          if (viewOptions.showVertexNumbers) {
            ctx.fillText(index.toString(), x, y);
          }
        }
      }
    });
  };

  const drawGlobalEdges = (ctx: CanvasRenderingContext2D) => {
    if (!board) return;
    
    const perimeterEdges = new Set(getPerimeterEdges(board));
    
    board.globalEdges.forEach((edge, id) => {
      const v1 = board.globalVertices.get(edge.vertices[0]);
      const v2 = board.globalVertices.get(edge.vertices[1]);
      
      if (!v1 || !v2) return;
      
      ctx.beginPath();
      ctx.moveTo(v1.position.x, v1.position.y);
      ctx.lineTo(v2.position.x, v2.position.y);
      
      if (viewOptions.showPerimeter && perimeterEdges.has(id)) {
        ctx.strokeStyle = '#FF6B6B';
        ctx.lineWidth = 3;
      } else {
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1;
      }
      
      ctx.stroke();
    });
  };

  const drawBuildings = (ctx: CanvasRenderingContext2D) => {
    if (!board) return;
    
    board.buildings.forEach((building, vertexId) => {
      const vertex = board.globalVertices.get(vertexId);
      if (!vertex) return;
      
      const { x, y } = vertex.position;
      const playerColor = PLAYER_COLORS[building.player - 1];
      
      if (building.type === BuildingType.Settlement) {
        // Draw settlement (house shape)
        ctx.beginPath();
        ctx.moveTo(x, y - 12);
        ctx.lineTo(x + 10, y - 4);
        ctx.lineTo(x + 10, y + 8);
        ctx.lineTo(x - 10, y + 8);
        ctx.lineTo(x - 10, y - 4);
        ctx.closePath();
        
        ctx.fillStyle = playerColor;
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (building.type === BuildingType.City) {
        // Draw city (larger with walls)
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
        
        ctx.fillStyle = playerColor;
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
  };

  const drawInfoPanel = (ctx: CanvasRenderingContext2D) => {
    if (!board) return;
    
    // Draw stats panel
    const panelX = 20;
    const panelY = 20;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(panelX, panelY, 200, 110);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.strokeRect(panelX, panelY, 200, 110);
    
    ctx.fillStyle = '#000';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Board Statistics', panelX + 10, panelY + 20);
    
    ctx.font = '12px Arial';
    ctx.fillText(`Hexes: ${board.hexes.length}`, panelX + 10, panelY + 40);
    ctx.fillText(`Vertices: ${board.globalVertices.size}`, panelX + 10, panelY + 55);
    ctx.fillText(`Portable: ${getPortableVertices(board).length}`, panelX + 10, panelY + 70);
    ctx.fillText(`Edges: ${board.globalEdges.size}`, panelX + 10, panelY + 85);
    
    // Draw selected hex info
    if (selectedHex !== null) {
      const hex = board.hexes[selectedHex];
      const infoX = 950;
      const infoY = 50;
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fillRect(infoX, infoY, 230, 200);
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.strokeRect(infoX, infoY, 230, 200);
      
      ctx.fillStyle = '#000';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(`Hex ${hex.index}`, infoX + 10, infoY + 25);
      
      ctx.font = '12px Arial';
      let y = infoY + 50;
      ctx.fillText(`Resource: ${hex.resource || 'Desert'}`, infoX + 10, y);
      y += 20;
      ctx.fillText(`Number: ${hex.numberToken || 'None'}`, infoX + 10, y);
      y += 20;
      ctx.fillText(`Neighbors: ${hex.neighbors.join(', ')}`, infoX + 10, y);
      y += 20;
      
      // Draw edges info with perimeter status
      ctx.font = 'bold 12px Arial';
      ctx.fillText('Edges:', infoX + 10, y);
      y += 15;
      
      // Check which edges are perimeter
      const perimeterEdges = new Set(getPerimeterEdges(board));
      ctx.font = '10px Arial';
      
      HEX_EDGES.forEach((edge, i) => {
        // Find the global edge for this hex edge
        let isPerimeter = false;
        let edgeId = '';
        
        // Find global vertices for this edge
        let v1Id = '', v2Id = '';
        for (const [id, gv] of board.globalVertices) {
          if (gv.hexes.some(h => h.hexIndex === hex.index && h.vertexIndex === edge[0])) {
            v1Id = id;
          }
          if (gv.hexes.some(h => h.hexIndex === hex.index && h.vertexIndex === edge[1])) {
            v2Id = id;
          }
        }
        
        if (v1Id && v2Id) {
          edgeId = [v1Id, v2Id].sort().join('-');
          isPerimeter = perimeterEdges.has(edgeId);
        }
        
        const edgeText = `[${edge[0]},${edge[1]}]`;
        const xPos = infoX + 10 + (i % 2) * 110;
        const yPos = y + Math.floor(i / 2) * 15;
        
        ctx.fillStyle = isPerimeter ? '#FF6B6B' : '#000';
        ctx.fillText(edgeText, xPos, yPos);
        
        if (isPerimeter) {
          ctx.fillText('(P)', xPos + 40, yPos);
        }
      });
    }
    
    // Draw selected vertex info
    if (selectedVertex && board) {
      const vertex = board.globalVertices.get(selectedVertex);
      if (vertex) {
        const infoX = 950;
        const infoY = 300;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fillRect(infoX, infoY, 230, 120);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.strokeRect(infoX, infoY, 230, 120);
        
        ctx.fillStyle = '#000';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`Vertex ${selectedVertex}`, infoX + 10, infoY + 25);
        
        ctx.font = '11px Arial';
        let y = infoY + 45;
        ctx.fillText(`Position: (${vertex.position.x.toFixed(0)}, ${vertex.position.y.toFixed(0)})`, infoX + 10, y);
        y += 18;
        ctx.fillText('Shared by hexes:', infoX + 10, y);
        y += 15;
        
        vertex.hexes.forEach(h => {
          ctx.fillText(`  Hex ${h.hexIndex}, vertex ${h.vertexIndex}`, infoX + 10, y);
          y += 15;
        });
      }
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!board || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Check for vertex click first (smaller target)
    for (const [id, vertex] of board.globalVertices) {
      const dx = x - vertex.position.x;
      const dy = y - vertex.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 10) {
        setSelectedVertex(id);
        setSelectedHex(null);
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
        return;
      }
    }
    
    setSelectedHex(null);
    setSelectedVertex(null);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f0f0f0' }}>
      {/* Left Sidebar */}
      <div style={{ 
        width: '350px', 
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
            <p>Player {gameState.currentPlayer}'s Turn</p>
            <p>Turn: {gameState.turn}</p>
            <p>Phase: {gameState.phase}</p>
          </div>
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
                checked={viewOptions.showVertexNumbers}
                onChange={(e) => setViewOptions({...viewOptions, showVertexNumbers: e.target.checked})}
              />
              Show Vertex Numbers
            </label>
            <label style={{ marginRight: '20px' }}>
              <input
                type="checkbox"
                checked={viewOptions.showPerimeter}
                onChange={(e) => setViewOptions({...viewOptions, showPerimeter: e.target.checked})}
              />
              Highlight Perimeter
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
              const hexRadius = getHexRadius(viewOptions.boardSize);
              const canvasSize = getCanvasSize(viewOptions.boardSize);
              const center = { x: canvasSize / 2, y: canvasSize / 2 };
              const newBoard = initializeBoard(viewOptions.boardSize, hexRadius, center);
              setBoard(newBoard);
              addLogEntry('New board generated', 'system');
            }} style={{ marginLeft: '20px' }}>
              New Board
            </button>
          </div>
          <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
            {selectedVertex ? `Selected vertex: ${selectedVertex}` : 'Click on hexes or vertices to inspect'}
          </p>
        </div>
        
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <canvas
            ref={canvasRef}
            width={getCanvasSize(viewOptions.boardSize)}
            height={getCanvasSize(viewOptions.boardSize)}
            onClick={handleCanvasClick}
            style={{
              border: '2px solid #333',
              backgroundColor: '#fff',
              cursor: 'pointer',
              maxWidth: '100%',
              maxHeight: 'calc(100vh - 200px)'
            }}
          />
        </div>
      </div>
    </div>
  );
};