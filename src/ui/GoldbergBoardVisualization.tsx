import React, { useEffect, useRef, useState } from 'react';
import { 
  GoldbergBoard, 
  Face, 
  FaceType,
  PentagonFace,
  project3DTo2D,
  geodesicDistance
} from '@/models/goldberg.models';
import { 
  initializeGoldbergBoard,
  getPentagonNeighbors,
  configurePentagonPort
} from '@/models/goldberg.initialization';
import { Resource } from '@/types';

const RESOURCE_COLORS: Record<Resource, string> = {
  [Resource.Wood]: '#2D5016',
  [Resource.Brick]: '#B8584D',
  [Resource.Sheep]: '#83C55B',
  [Resource.Wheat]: '#F4C842',
  [Resource.Ore]: '#7A7A7A'
};

interface CameraRotation {
  theta: number; // Horizontal rotation
  phi: number;   // Vertical rotation
}

interface GameState {
  currentPlayer: number;
  playerResources: Record<number, Record<Resource, number>>;
  playerSOL: Record<number, number>;
}

export const GoldbergBoardVisualization: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [board, setBoard] = useState<GoldbergBoard | null>(null);
  const [selectedFace, setSelectedFace] = useState<number | null>(null);
  const [hoveredFace, setHoveredFace] = useState<number | null>(null);
  const [cameraRotation, setCameraRotation] = useState<CameraRotation>({ theta: 0, phi: Math.PI / 6 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, theta: 0, phi: 0 });
  const [zoom, setZoom] = useState(1);
  const [gameState, setGameState] = useState<GameState>({
    currentPlayer: 1,
    playerResources: {
      1: { [Resource.Wood]: 0, [Resource.Brick]: 0, [Resource.Sheep]: 0, [Resource.Wheat]: 0, [Resource.Ore]: 0 },
      2: { [Resource.Wood]: 0, [Resource.Brick]: 0, [Resource.Sheep]: 0, [Resource.Wheat]: 0, [Resource.Ore]: 0 },
      3: { [Resource.Wood]: 0, [Resource.Brick]: 0, [Resource.Sheep]: 0, [Resource.Wheat]: 0, [Resource.Ore]: 0 },
      4: { [Resource.Wood]: 0, [Resource.Brick]: 0, [Resource.Sheep]: 0, [Resource.Wheat]: 0, [Resource.Ore]: 0 }
    },
    playerSOL: { 1: 1000, 2: 1000, 3: 1000, 4: 1000 }
  });
  
  const CANVAS_WIDTH = 1400;
  const CANVAS_HEIGHT = 800;
  
  useEffect(() => {
    const newBoard = initializeGoldbergBoard();
    setBoard(newBoard);
  }, []);
  
  useEffect(() => {
    if (!board || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Dark gradient background
    const gradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#0a0e27');
    gradient.addColorStop(1, '#1a1f3a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw sphere outline
    ctx.save();
    ctx.strokeStyle = 'rgba(100, 150, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const sphereRadius = Math.min(CANVAS_WIDTH, CANVAS_HEIGHT) * 0.4 * zoom;
    ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, sphereRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    
    // Sort faces by depth (back to front)
    const facesWithDepth = board.faces.map(face => {
      const rotatedCenter = rotateVertex(face.center, cameraRotation);
      return { face, depth: rotatedCenter.z };
    });
    facesWithDepth.sort((a, b) => a.depth - b.depth);
    
    // Draw faces
    facesWithDepth.forEach(({ face }) => {
      drawFace(ctx, face, board, cameraRotation, zoom);
    });
    
  }, [board, cameraRotation, zoom, selectedFace, hoveredFace]);
  
  const rotateVertex = (vertex: { x: number; y: number; z: number }, rotation: CameraRotation) => {
    // Rotate around Y axis (theta)
    const cosTheta = Math.cos(-rotation.theta);
    const sinTheta = Math.sin(-rotation.theta);
    let x = vertex.x * cosTheta - vertex.z * sinTheta;
    let z = vertex.x * sinTheta + vertex.z * cosTheta;
    let y = vertex.y;
    
    // Rotate around X axis (phi)
    const cosPhi = Math.cos(-rotation.phi);
    const sinPhi = Math.sin(-rotation.phi);
    const newY = y * cosPhi - z * sinPhi;
    const newZ = y * sinPhi + z * cosPhi;
    
    return { x, y: newY, z: newZ };
  };
  
  const drawFace = (
    ctx: CanvasRenderingContext2D,
    face: Face,
    board: GoldbergBoard,
    rotation: CameraRotation,
    zoom: number
  ) => {
    // Check if face is visible
    const rotatedCenter = rotateVertex(face.center, rotation);
    if (rotatedCenter.z < -0.1) return; // Face is on back side
    
    // Project vertices to 2D
    const projectedVertices = face.vertexIds.map(vId => {
      const vertex = board.vertices.get(vId)!;
      return project3DTo2D(vertex, rotation, CANVAS_WIDTH, CANVAS_HEIGHT, zoom);
    });
    
    // Check if any vertex is visible
    if (!projectedVertices.some(v => v.visible)) return;
    
    // Draw face
    ctx.save();
    ctx.beginPath();
    projectedVertices.forEach((v, i) => {
      if (i === 0) ctx.moveTo(v.x, v.y);
      else ctx.lineTo(v.x, v.y);
    });
    ctx.closePath();
    
    // Fill based on face type and state
    if (face.type === FaceType.Pentagon) {
      // Pentagon (port)
      const pentagon = face as PentagonFace;
      if (pentagon.portConfig) {
        // Configured port - show gradient of two resources
        const gradient = ctx.createLinearGradient(
          projectedVertices[0].x, projectedVertices[0].y,
          projectedVertices[2].x, projectedVertices[2].y
        );
        gradient.addColorStop(0, RESOURCE_COLORS[pentagon.portConfig.resource1]);
        gradient.addColorStop(1, RESOURCE_COLORS[pentagon.portConfig.resource2]);
        ctx.fillStyle = gradient;
      } else {
        // Unconfigured port
        ctx.fillStyle = '#FFD700'; // Gold color
      }
    } else {
      // Hexagon (resource tile)
      if (face.resource) {
        ctx.fillStyle = RESOURCE_COLORS[face.resource];
      } else {
        ctx.fillStyle = '#F5DEB3'; // Desert color
      }
    }
    
    // Apply lighting based on face normal
    const brightness = 0.7 + 0.3 * Math.max(0, rotatedCenter.z);
    ctx.globalAlpha = brightness;
    ctx.fill();
    ctx.globalAlpha = 1;
    
    // Draw outline
    ctx.strokeStyle = selectedFace === face.id ? '#00FF00' : 
                     hoveredFace === face.id ? '#FFFF00' : '#333';
    ctx.lineWidth = selectedFace === face.id ? 3 : 
                    hoveredFace === face.id ? 2 : 1;
    ctx.stroke();
    
    // Draw face info (number token, port symbol, etc.)
    if (face.type === FaceType.Pentagon) {
      // Draw port symbol
      const centerProj = project3DTo2D(face.center, rotation, CANVAS_WIDTH, CANVAS_HEIGHT, zoom);
      if (centerProj.visible) {
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚓', centerProj.x, centerProj.y);
      }
    } else if (face.numberToken) {
      // Draw number token for hexagons
      const centerProj = project3DTo2D(face.center, rotation, CANVAS_WIDTH, CANVAS_HEIGHT, zoom);
      if (centerProj.visible) {
        // Token background
        ctx.beginPath();
        ctx.arc(centerProj.x, centerProj.y, 18, 0, Math.PI * 2);
        ctx.fillStyle = '#FFF8DC';
        ctx.fill();
        ctx.strokeStyle = '#8B6F47';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Number
        ctx.fillStyle = face.numberToken === 6 || face.numberToken === 8 ? '#C62828' : '#333';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(face.numberToken.toString(), centerProj.x, centerProj.y);
      }
    }
    
    // Draw robber
    if (face.hasRobber) {
      const centerProj = project3DTo2D(face.center, rotation, CANVAS_WIDTH, CANVAS_HEIGHT, zoom);
      if (centerProj.visible) {
        ctx.fillStyle = '#000';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🦹', centerProj.x, centerProj.y);
      }
    }
    
    ctx.restore();
  };
  
  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDragging(true);
    setDragStart({
      x,
      y,
      theta: cameraRotation.theta,
      phi: cameraRotation.phi
    });
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (isDragging) {
      // Rotate camera based on drag
      const deltaX = x - dragStart.x;
      const deltaY = y - dragStart.y;
      
      setCameraRotation({
        theta: dragStart.theta + deltaX * 0.01,
        phi: Math.max(0.1, Math.min(Math.PI - 0.1, dragStart.phi - deltaY * 0.01))
      });
    } else {
      // Check hover
      if (board) {
        const hoveredFaceId = findFaceAtPosition(x, y, board, cameraRotation, zoom);
        setHoveredFace(hoveredFaceId);
      }
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleClick = (e: React.MouseEvent) => {
    if (isDragging) return;
    
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (board) {
      const clickedFaceId = findFaceAtPosition(x, y, board, cameraRotation, zoom);
      setSelectedFace(clickedFaceId);
    }
  };
  
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.5, Math.min(3, prev * delta)));
  };
  
  const findFaceAtPosition = (
    x: number,
    y: number,
    board: GoldbergBoard,
    rotation: CameraRotation,
    zoom: number
  ): number | null => {
    // Simple point-in-polygon test for each visible face
    for (const face of board.faces) {
      const rotatedCenter = rotateVertex(face.center, rotation);
      if (rotatedCenter.z < -0.1) continue; // Skip back faces
      
      const vertices = face.vertexIds.map(vId => {
        const vertex = board.vertices.get(vId)!;
        return project3DTo2D(vertex, rotation, CANVAS_WIDTH, CANVAS_HEIGHT, zoom);
      });
      
      if (pointInPolygon(x, y, vertices)) {
        return face.id;
      }
    }
    return null;
  };
  
  const pointInPolygon = (x: number, y: number, vertices: { x: number; y: number }[]): boolean => {
    let inside = false;
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
      const xi = vertices[i].x, yi = vertices[i].y;
      const xj = vertices[j].x, yj = vertices[j].y;
      
      const intersect = ((yi > y) !== (yj > y))
          && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };
  
  const renderSelectedFaceInfo = () => {
    if (!board || selectedFace === null) return null;
    
    const face = board.faces[selectedFace];
    const isPentagon = face.type === FaceType.Pentagon;
    
    return (
      <div className="absolute bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-sm">
        <h3 className="font-bold text-lg mb-2">
          {isPentagon ? '⚓ Port' : '⬢ Resource Tile'} #{face.id}
        </h3>
        
        {isPentagon ? (
          <div>
            <p className="text-sm mb-2">Configure AMM trading pair:</p>
            <div className="space-y-2">
              <p className="text-xs">Adjacent resources:</p>
              {getPentagonNeighbors(board, face.id).map((neighbor, i) => (
                <div key={i} className="text-xs">
                  • {neighbor.resource || 'Desert'}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm">Resource: {face.resource || 'Desert'}</p>
            {face.numberToken && (
              <p className="text-sm">Number: {face.numberToken}</p>
            )}
            {face.hasRobber && (
              <p className="text-sm text-red-400">🦹 Robber is here!</p>
            )}
          </div>
        )}
      </div>
    );
  };
  
  const renderPlayerResources = () => {
    const player = gameState.currentPlayer;
    const resources = gameState.playerResources[player];
    const sol = gameState.playerSOL[player];
    
    return (
      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        <h3 className="font-bold text-lg mb-3">Player {player} Resources</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>SOL:</span>
            <span className="font-mono">{sol}</span>
          </div>
          {Object.entries(resources).map(([resource, amount]) => (
            <div key={resource} className="flex justify-between">
              <span className="flex items-center gap-2">
                <span 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: RESOURCE_COLORS[resource as Resource] }}
                />
                {resource}:
              </span>
              <span className="font-mono">{amount}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="flex h-screen bg-gray-900">
      {/* Left Sidebar */}
      <div className="w-80 bg-gray-800 text-white p-4 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">CATAMM Sphere</h2>
        
        {renderPlayerResources()}
        
        <div className="mb-4">
          <h3 className="font-bold mb-2">Controls</h3>
          <p className="text-sm text-gray-400">• Drag to rotate</p>
          <p className="text-sm text-gray-400">• Scroll to zoom</p>
          <p className="text-sm text-gray-400">• Click to select</p>
        </div>
        
        <div className="mb-4">
          <h3 className="font-bold mb-2">Board Info</h3>
          <p className="text-sm">1 Central Pentagon Port</p>
          <p className="text-sm">19 Hexagon Tiles</p>
          <p className="text-sm">Expandable GP(1,4) Sphere</p>
        </div>
        
        <button
          onClick={() => setCameraRotation({ theta: 0, phi: Math.PI / 4 })}
          className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
        >
          Reset View
        </button>
      </div>
      
      {/* Main Canvas */}
      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="w-full h-full object-contain cursor-move"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={handleClick}
          onWheel={handleWheel}
        />
        
        {renderSelectedFaceInfo()}
      </div>
    </div>
  );
};