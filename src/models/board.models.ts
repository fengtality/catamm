// Board data models for CATAMM
// Hex numbering: Center = 0, then clockwise starting from East
// Vertex numbering: 0 at top, then clockwise (0-5)

import { Resource } from '@/types';

// Represents a vertex-based edge (between two vertices)
export type Edge = [number, number]; // e.g., [0, 1] for top edge

// Standard edges for a hex (vertex pairs)
export const HEX_EDGES: Edge[] = [
  [0, 1], // Top to top-right
  [1, 2], // Top-right to bottom-right
  [2, 3], // Bottom-right to bottom
  [3, 4], // Bottom to bottom-left
  [4, 5], // Bottom-left to top-left
  [5, 0]  // Top-left to top
];

// Represents a single hexagonal tile
export interface Hex {
  index: number; // 0-18, with 0 at center
  resource: Resource | null; // null for desert
  numberToken: number | null; // 2-12, null for desert
  position: {
    x: number; // pixel coordinates
    y: number;
  };
  coordinates: {
    q: number; // axial coordinates
    r: number;
  };
  vertices: Vertex[]; // 6 vertices (0-5)
  neighbors: number[]; // indices of neighboring hexes
  hasRobber: boolean;
}

// Represents a vertex of a hex
export interface Vertex {
  index: number; // 0-5 within the hex
  position: {
    x: number; // pixel coordinates
    y: number;
  };
  angle: number; // angle in radians from center
}

// Global vertex (shared between hexes)
export interface GlobalVertex {
  id: string; // unique identifier
  position: {
    x: number;
    y: number;
  };
  hexes: Array<{
    hexIndex: number;
    vertexIndex: number;
  }>; // up to 3 hexes share a vertex
}

// Global edge (for roads)
export interface GlobalEdge {
  id: string; // unique identifier
  vertices: [string, string]; // global vertex IDs
  hexes: Array<{
    hexIndex: number;
    edge: Edge;
  }>; // 1 or 2 hexes share an edge
}


// Building types
export enum BuildingType {
  Settlement = 'settlement',
  City = 'city'
}

// Building on a vertex
export interface Building {
  type: BuildingType;
  player: number;
  vertexId: string;
}

// Complete board state
export interface Board {
  hexes: Hex[];
  globalVertices: Map<string, GlobalVertex>;
  globalEdges: Map<string, GlobalEdge>;
  robberLocation: number; // hex index where robber is located
  buildings: Map<string, Building>; // vertexId -> Building
  roads: Map<string, number>; // edgeId -> player number
}


// Helper type for hex layout definition
export interface HexLayoutDefinition {
  index: number;
  q: number;
  r: number;
  neighborIndices: number[]; // just the indices of neighboring hexes
}

// Constants for board setup
export const BOARD_CENTER_X = 450;
export const BOARD_CENTER_Y = 350;
export const HEX_RADIUS = 70; // Increased for better visibility

// Generate hex layout dynamically based on number of rings
export function generateHexLayout(rings: number): HexLayoutDefinition[] {
  const hexes: HexLayoutDefinition[] = [];
  let index = 0;
  
  // Center hex
  hexes.push({
    index: index++,
    q: 0,
    r: 0,
    neighborIndices: [] // Will be filled after all hexes are generated
  });
  
  // Generate rings
  for (let ring = 1; ring <= rings; ring++) {
    // Start from the east position for each ring
    let currentQ = ring;
    let currentR = 0;
    
    // Directions to move around the ring (clockwise)
    const moveDirections = [
      { q: -1, r: 1 },   // Move SW
      { q: -1, r: 0 },   // Move W
      { q: 0, r: -1 },   // Move NW
      { q: 1, r: -1 },   // Move NE
      { q: 1, r: 0 },    // Move E
      { q: 0, r: 1 }     // Move SE
    ];
    
    // Place hexes around the ring
    for (let side = 0; side < 6; side++) {
      for (let step = 0; step < ring; step++) {
        hexes.push({
          index: index++,
          q: currentQ,
          r: currentR,
          neighborIndices: []
        });
        
        // Move to next position unless it's the last hex of the ring
        if (!(side === 5 && step === ring - 1)) {
          currentQ += moveDirections[side].q;
          currentR += moveDirections[side].r;
        }
      }
    }
  }
  
  // Now fill in neighbor indices
  hexes.forEach((hex) => {
    const neighbors: number[] = [];
    const directions = [
      { q: 1, r: 0 }, { q: 0, r: 1 }, { q: -1, r: 1 },
      { q: -1, r: 0 }, { q: 0, r: -1 }, { q: 1, r: -1 }
    ];
    
    directions.forEach(dir => {
      const neighborQ = hex.q + dir.q;
      const neighborR = hex.r + dir.r;
      const neighborIndex = hexes.findIndex(h => h.q === neighborQ && h.r === neighborR);
      if (neighborIndex !== -1) {
        neighbors.push(neighborIndex);
      }
    });
    
    hex.neighborIndices = neighbors;
  });
  
  return hexes;
}

// Define the hex layout with new numbering system
// Center = 0, then clockwise from East
// Using standard Catan board layout (19 hexes total)
export const HEX_LAYOUT: HexLayoutDefinition[] = [
  // Center hex
  { index: 0, q: 0, r: 0, neighborIndices: [1, 2, 3, 4, 5, 6] },
  
  // First ring - clockwise from East
  { index: 1, q: 1, r: 0, neighborIndices: [0, 6, 18, 7, 8, 9, 2] },    // E
  { index: 2, q: 0, r: 1, neighborIndices: [0, 1, 9, 10, 3] },          // SE (below and between 0 and 1)
  { index: 3, q: -1, r: 1, neighborIndices: [0, 2, 10, 11, 12, 4] },    // SW
  { index: 4, q: -1, r: 0, neighborIndices: [0, 3, 12, 13, 14, 5] },    // W
  { index: 5, q: 0, r: -1, neighborIndices: [0, 4, 14, 15, 16, 6] },    // NW
  { index: 6, q: 1, r: -1, neighborIndices: [0, 5, 16, 17, 18, 7, 1] }, // NE
  
  // Second ring - continuing clockwise from outer ring
  { index: 7, q: 2, r: -1, neighborIndices: [1, 6, 8] },              // E of 6 
  { index: 8, q: 2, r: 0, neighborIndices: [1, 7, 9] },               // SE of 7
  { index: 9, q: 1, r: 1, neighborIndices: [1, 2, 8, 10] },           // S of 8
  { index: 10, q: 0, r: 2, neighborIndices: [2, 3, 9, 11] },          // S 
  { index: 11, q: -1, r: 2, neighborIndices: [3, 10, 12] },           // SW of 10
  { index: 12, q: -2, r: 2, neighborIndices: [3, 4, 11, 13] },        // W of 11
  { index: 13, q: -2, r: 1, neighborIndices: [4, 12, 14] },           // NW of 12
  { index: 14, q: -2, r: 0, neighborIndices: [4, 5, 13, 15] },        // N of 13
  { index: 15, q: -1, r: -1, neighborIndices: [5, 14, 16] },          // NE of 14
  { index: 16, q: 0, r: -2, neighborIndices: [5, 6, 15, 17] },        // N of 15
  { index: 17, q: 1, r: -2, neighborIndices: [6, 16, 18] },           // E of 16
  { index: 18, q: 2, r: -2, neighborIndices: [6, 7, 17] }             // SE of 17, completing the ring
];


// Helper functions
export function getVertexAngle(vertexIndex: number): number {
  // Vertex 0 is at top (90 degrees), then clockwise
  return (Math.PI / 2) - (vertexIndex * Math.PI / 3);
}

export function getVertexPosition(hexCenter: { x: number; y: number }, vertexIndex: number, radius: number): { x: number; y: number } {
  const angle = getVertexAngle(vertexIndex);
  return {
    x: hexCenter.x + radius * Math.cos(angle),
    y: hexCenter.y - radius * Math.sin(angle) // subtract for screen coordinates
  };
}

export function createGlobalVertexId(hexIndex: number, vertexIndex: number): string {
  return `h${hexIndex}v${vertexIndex}`;
}

export function createGlobalEdgeId(vertex1Id: string, vertex2Id: string): string {
  // Sort to ensure consistent ID regardless of direction
  return [vertex1Id, vertex2Id].sort().join('-');
}