// Board initialization logic for CATAMM with vertex-based model

import {
  Board,
  Hex,
  Vertex,
  GlobalVertex,
  GlobalEdge,
  HEX_LAYOUT,
  generateHexLayout,
  BOARD_CENTER_X,
  BOARD_CENTER_Y,
  HEX_RADIUS,
  getVertexAngle,
  getVertexPosition,
  createGlobalVertexId,
  createGlobalEdgeId,
  HEX_EDGES
} from './board.models';
import { Resource } from '@/types';

// Convert axial coordinates to pixel position
function axialToPixel(q: number, r: number, hexRadius: number): { x: number; y: number } {
  const x = hexRadius * Math.sqrt(3) * (q + r / 2);
  const y = hexRadius * 3 / 2 * r;
  return { x, y };
}

// Initialize a single hex with vertices
function initializeHex(
  index: number,
  q: number,
  r: number,
  neighbors: number[],
  centerX: number,
  centerY: number,
  hexRadius: number
): Hex {
  const pixelPos = axialToPixel(q, r, hexRadius);
  const hexCenter = {
    x: centerX + pixelPos.x,
    y: centerY + pixelPos.y
  };
  
  // Create vertices
  const vertices: Vertex[] = [];
  for (let i = 0; i < 6; i++) {
    const pos = getVertexPosition(hexCenter, i, hexRadius);
    vertices.push({
      index: i,
      position: pos,
      angle: getVertexAngle(i)
    });
  }

  return {
    index,
    resource: null, // Will be assigned later
    numberToken: null, // Will be assigned later
    position: hexCenter,
    coordinates: { q, r },
    vertices,
    neighbors,
    hasRobber: false
  };
}

// Build global vertex map (merge shared vertices)
function buildGlobalVertices(hexes: Hex[]): Map<string, GlobalVertex> {
  const globalVertices = new Map<string, GlobalVertex>();
  const vertexPositions = new Map<string, string>(); // position key -> vertex ID
  
  // Helper to create position key (rounded to avoid floating point issues)
  const posKey = (pos: { x: number; y: number }) => 
    `${Math.round(pos.x)},${Math.round(pos.y)}`;
  
  hexes.forEach(hex => {
    hex.vertices.forEach((vertex, vIndex) => {
      const key = posKey(vertex.position);
      const localId = createGlobalVertexId(hex.index, vIndex);
      
      if (vertexPositions.has(key)) {
        // Vertex already exists, add this hex to it
        const globalId = vertexPositions.get(key)!;
        const globalVertex = globalVertices.get(globalId)!;
        globalVertex.hexes.push({ hexIndex: hex.index, vertexIndex: vIndex });
      } else {
        // New vertex
        const globalVertex: GlobalVertex = {
          id: localId,
          position: { ...vertex.position },
          hexes: [{ hexIndex: hex.index, vertexIndex: vIndex }]
        };
        globalVertices.set(localId, globalVertex);
        vertexPositions.set(key, localId);
      }
    });
  });
  
  return globalVertices;
}

// Build global edge map (merge shared edges)
function buildGlobalEdges(hexes: Hex[], globalVertices: Map<string, GlobalVertex>): Map<string, GlobalEdge> {
  const globalEdges = new Map<string, GlobalEdge>();
  
  // Helper to find global vertex ID for a hex vertex
  const findGlobalVertexId = (hexIndex: number, vertexIndex: number): string => {
    for (const [id, gv] of globalVertices) {
      if (gv.hexes.some(h => h.hexIndex === hexIndex && h.vertexIndex === vertexIndex)) {
        return id;
      }
    }
    throw new Error(`Global vertex not found for hex ${hexIndex}, vertex ${vertexIndex}`);
  };
  
  // Process each hex and its edges
  hexes.forEach(hex => {
    HEX_EDGES.forEach(edge => {
      const v1Id = findGlobalVertexId(hex.index, edge[0]);
      const v2Id = findGlobalVertexId(hex.index, edge[1]);
      const edgeId = createGlobalEdgeId(v1Id, v2Id);
      
      // Check if this edge already exists
      if (globalEdges.has(edgeId)) {
        // Add this hex to the existing edge if not already present
        const existingEdge = globalEdges.get(edgeId)!;
        if (!existingEdge.hexes.some(h => h.hexIndex === hex.index)) {
          existingEdge.hexes.push({ hexIndex: hex.index, edge });
        }
      } else {
        // Create new edge
        globalEdges.set(edgeId, {
          id: edgeId,
          vertices: [v1Id, v2Id],
          hexes: [{ hexIndex: hex.index, edge }]
        });
      }
    });
  });
  
  return globalEdges;
}


// Assign resources and numbers to hexes
function assignResourcesAndNumbers(hexes: Hex[]): void {
  // Generate resources based on board size
  const resourceList = [Resource.Wood, Resource.Brick, Resource.Sheep, Resource.Wheat, Resource.Ore];
  const resources: (Resource | null)[] = [];
  
  // Always have exactly 1 desert
  const nonDesertCount = hexes.length - 1;
  const resourcesPerType = Math.floor(nonDesertCount / 5);
  const remainder = nonDesertCount % 5;
  
  // Add resources
  resourceList.forEach((resource, i) => {
    const count = resourcesPerType + (i < remainder ? 1 : 0);
    resources.push(...Array(count).fill(resource));
  });
  
  // Add exactly one desert
  resources.push(null);
  
  // Generate number tokens based on dice probability distribution
  const numberTokens: number[] = [];
  
  // Probability weights based on dice combinations (out of 36)
  // Note: 7 is excluded - it's reserved for the robber
  const probabilityWeights: Record<number, number> = {
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
  
  // Create weighted array for random selection
  const weightedNumbers: number[] = [];
  Object.entries(probabilityWeights).forEach(([num, weight]) => {
    for (let i = 0; i < weight; i++) {
      weightedNumbers.push(parseInt(num));
    }
  });
  
  // Generate tokens by random selection from weighted distribution
  for (let i = 0; i < nonDesertCount; i++) {
    const randomIndex = Math.floor(Math.random() * weightedNumbers.length);
    numberTokens.push(weightedNumbers[randomIndex]);
  }
  
  // Shuffle resources
  for (let i = resources.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [resources[i], resources[j]] = [resources[j], resources[i]];
  }
  
  // Assign resources
  hexes.forEach((hex, i) => {
    hex.resource = resources[i];
  });
  
  // Find desert and place robber
  const desertIndex = hexes.findIndex(h => h.resource === null);
  hexes[desertIndex].hasRobber = true;
  
  // Shuffle the number tokens
  for (let i = numberTokens.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numberTokens[i], numberTokens[j]] = [numberTokens[j], numberTokens[i]];
  }
  
  // Place numbers on non-desert hexes
  let tokenIndex = 0;
  hexes.forEach((hex) => {
    if (hex.resource !== null) {
      hex.numberToken = numberTokens[tokenIndex++];
    }
  });
}

// Initialize the complete board
export function initializeBoard(boardSize: number = 2, customHexRadius?: number, customCenter?: { x: number; y: number }): Board {
  // Generate hex layout for the given size
  const hexLayout = boardSize === 2 ? HEX_LAYOUT : generateHexLayout(boardSize);
  
  // Use custom radius if provided, otherwise use default
  const hexRadius = customHexRadius || HEX_RADIUS;
  const centerX = customCenter?.x || BOARD_CENTER_X;
  const centerY = customCenter?.y || BOARD_CENTER_Y;
  
  // Create all hexes
  const hexes: Hex[] = hexLayout.map(hexDef => 
    initializeHex(
      hexDef.index,
      hexDef.q,
      hexDef.r,
      hexDef.neighborIndices,
      centerX,
      centerY,
      hexRadius
    )
  );
  
  // Build global vertex and edge maps
  const globalVertices = buildGlobalVertices(hexes);
  const globalEdges = buildGlobalEdges(hexes, globalVertices);
  
  // Assign resources and numbers
  assignResourcesAndNumbers(hexes);
  
  // Find robber location
  const robberLocation = hexes.findIndex(h => h.hasRobber);
  
  return {
    hexes,
    globalVertices,
    globalEdges,
    robberLocation,
    buildings: new Map(),
    roads: new Map()
  };
}

// Get perimeter edges (edges that belong to only one hex)
export function getPerimeterEdges(board: Board): string[] {
  const perimeterEdgeIds: string[] = [];
  
  board.globalEdges.forEach((edge, id) => {
    if (edge.hexes.length === 1) {
      perimeterEdgeIds.push(id);
    }
  });
  
  return perimeterEdgeIds;
}

// Get perimeter vertices (for debugging/validation)
export function getPerimeterVertices(board: Board): string[] {
  const perimeterVertexIds: string[] = [];
  const perimeterEdges = new Set(getPerimeterEdges(board));
  
  board.globalVertices.forEach((vertex, id) => {
    // A vertex is on the perimeter if it's part of at least one perimeter edge
    const isPerimeter = Array.from(board.globalEdges.values()).some(edge => 
      perimeterEdges.has(edge.id) && edge.vertices.includes(id)
    );
    
    if (isPerimeter) {
      perimeterVertexIds.push(id);
    }
  });
  
  return perimeterVertexIds;
}

// Get portable vertices (vertices between exactly 2 hexes and on the perimeter)
export function getPortableVertices(board: Board): string[] {
  const portableVertexIds: string[] = [];
  const perimeterVertices = new Set(getPerimeterVertices(board));
  
  board.globalVertices.forEach((vertex, id) => {
    // A vertex is portable if it's:
    // 1. On the perimeter
    // 2. Shared by exactly 2 hexes
    if (perimeterVertices.has(id) && vertex.hexes.length === 2) {
      portableVertexIds.push(id);
    }
  });
  
  return portableVertexIds;
}

// Find valid positions for new hexes adjacent to a perimeter vertex
export function findValidHexPositions(board: Board, vertexId: string): Array<{q: number, r: number}> {
  const vertex = board.globalVertices.get(vertexId);
  if (!vertex) return [];
  
  const validPositions: Array<{q: number, r: number}> = [];
  const existingPositions = new Set(board.hexes.map(h => `${h.coordinates.q},${h.coordinates.r}`));
  
  // Get all hexes that share this vertex
  const adjacentHexes = vertex.hexes.map(vh => board.hexes[vh.hexIndex]);
  
  // For each adjacent hex, check all 6 neighbor positions
  adjacentHexes.forEach(hex => {
    const directions = [
      { q: 1, r: 0 }, { q: 0, r: 1 }, { q: -1, r: 1 },
      { q: -1, r: 0 }, { q: 0, r: -1 }, { q: 1, r: -1 }
    ];
    
    directions.forEach(dir => {
      const newQ = hex.coordinates.q + dir.q;
      const newR = hex.coordinates.r + dir.r;
      const posKey = `${newQ},${newR}`;
      
      // Check if this position is empty and would share the perimeter vertex
      if (!existingPositions.has(posKey)) {
        // Verify this new hex would actually touch the perimeter vertex
        // This is a simplified check - full implementation would verify vertex sharing
        validPositions.push({ q: newQ, r: newR });
      }
    });
  });
  
  // Remove duplicates
  const uniquePositions = Array.from(new Set(validPositions.map(p => `${p.q},${p.r}`)))
    .map(key => {
      const [q, r] = key.split(',').map(Number);
      return { q, r };
    });
  
  return uniquePositions;
}

// Add a new hex to the board
export function addHexToBoard(
  board: Board, 
  position: { q: number; r: number },
  hexRadius: number = HEX_RADIUS,
  centerX: number = BOARD_CENTER_X,
  centerY: number = BOARD_CENTER_Y
): Board {
  const newIndex = board.hexes.length;
  
  // Find neighbors
  const neighbors: number[] = [];
  const directions = [
    { q: 1, r: 0 }, { q: 0, r: 1 }, { q: -1, r: 1 },
    { q: -1, r: 0 }, { q: 0, r: -1 }, { q: 1, r: -1 }
  ];
  
  directions.forEach(dir => {
    const neighborQ = position.q + dir.q;
    const neighborR = position.r + dir.r;
    const neighborIndex = board.hexes.findIndex(
      h => h.coordinates.q === neighborQ && h.coordinates.r === neighborR
    );
    if (neighborIndex !== -1) {
      neighbors.push(neighborIndex);
      // Update neighbor's neighbor list
      board.hexes[neighborIndex].neighbors.push(newIndex);
    }
  });
  
  // Create new hex
  const newHex = initializeHex(
    newIndex,
    position.q,
    position.r,
    neighbors,
    centerX,
    centerY,
    hexRadius
  );
  
  // Assign resource and number
  const resources = [Resource.Wood, Resource.Brick, Resource.Sheep, Resource.Wheat, Resource.Ore];
  newHex.resource = resources[Math.floor(Math.random() * resources.length)];
  
  // Generate number token from probability distribution (no 7 - reserved for robber)
  const numberOptions = [2, 3, 3, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6, 6, 
                         8, 8, 8, 8, 8, 9, 9, 9, 9, 10, 10, 10, 11, 11, 12];
  newHex.numberToken = numberOptions[Math.floor(Math.random() * numberOptions.length)];
  
  // Add hex to board
  const newHexes = [...board.hexes, newHex];
  
  // Rebuild global vertices and edges
  const newGlobalVertices = buildGlobalVertices(newHexes);
  const newGlobalEdges = buildGlobalEdges(newHexes, newGlobalVertices);
  
  return {
    hexes: newHexes,
    globalVertices: newGlobalVertices,
    globalEdges: newGlobalEdges,
    robberLocation: board.robberLocation,
    buildings: board.buildings,
    roads: board.roads
  };
}

