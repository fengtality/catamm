// Setup phase logic for Goldberg CATAMM
// Each player places 2 settlements and 2 roads

import {
  GameState,
  Vertex,
  calculateVictoryPoints,
  generateResources
} from './goldberg-game';
import {
  buildSettlement,
  buildRoad,
  BuildResult
} from './goldberg-building';

export interface SetupPlacement {
  settlementVertexId: string;
  roadEdgeId: string;
}

export interface OptimalPlacement {
  vertex: string;
  score: number;
  nearestPentagon: string;
  pentagonDistance: number;
  resourceValue: number;
  numberValue: number;
}

// Get optimal starting positions for all players
export function getOptimalStartingPositions(game: GameState): OptimalPlacement[][] {
  const playerCount = game.players.size;
  const allPlacements = evaluateAllVertices(game);
  const optimalPlacements: OptimalPlacement[][] = [];
  
  // Sort by score
  allPlacements.sort((a, b) => b.score - a.score);
  
  // Select positions that are well-distributed
  const usedVertices = new Set<string>();
  const usedRegions = new Set<string>();
  
  for (let round = 0; round < 2; round++) { // 2 settlements per player
    for (let player = 0; player < playerCount; player++) {
      if (!optimalPlacements[player]) optimalPlacements[player] = [];
      
      // Find best available position
      for (const placement of allPlacements) {
        if (usedVertices.has(placement.vertex)) continue;
        
        // Check distance from other settlements
        let tooClose = false;
        for (const used of usedVertices) {
          if (areVerticesTooClose(game, placement.vertex, used)) {
            tooClose = true;
            break;
          }
        }
        
        if (!tooClose) {
          optimalPlacements[player].push(placement);
          usedVertices.add(placement.vertex);
          
          // Mark region as used to ensure distribution
          const region = getVertexRegion(game, placement.vertex);
          usedRegions.add(region);
          break;
        }
      }
    }
  }
  
  return optimalPlacements;
}

// Evaluate all vertices for setup placement
function evaluateAllVertices(game: GameState): OptimalPlacement[] {
  const placements: OptimalPlacement[] = [];
  
  for (const [vertexId, vertex] of game.vertices) {
    // Skip if vertex doesn't touch exactly 3 hexes (not a valid settlement spot)
    if (vertex.faces.length !== 3) continue;
    
    // Skip if any adjacent face is a pentagon (can't start on pentagons)
    const touchesPentagon = vertex.faces.some(faceId => 
      game.faces.get(faceId)?.type === 'pentagon'
    );
    if (touchesPentagon) continue;
    
    // Calculate placement value
    const evaluation = evaluateVertex(game, vertex);
    placements.push({
      vertex: vertexId,
      ...evaluation
    });
  }
  
  return placements;
}

// Evaluate a single vertex for placement
function evaluateVertex(game: GameState, vertex: Vertex): Omit<OptimalPlacement, 'vertex'> {
  let resourceValue = 0;
  let numberValue = 0;
  
  // Evaluate adjacent hexagons
  for (const faceId of vertex.faces) {
    const face = game.faces.get(faceId);
    if (face?.type === 'hexagon') {
      const hex = face as any;
      
      // Resource diversity bonus
      if (hex.resource) {
        resourceValue += getResourceWeight(hex.resource);
      }
      
      // Number probability value
      if (hex.numberToken) {
        numberValue += getNumberProbability(hex.numberToken);
      }
    }
  }
  
  // Find nearest pentagon
  const { nearestPentagon, distance } = findNearestPentagon(game, vertex);
  
  // Calculate composite score
  // Balance resource value, number probability, and pentagon proximity
  const pentagonProximityScore = Math.max(0, 10 - distance * 20); // Closer is better
  const score = resourceValue * 2 + numberValue * 3 + pentagonProximityScore;
  
  return {
    score,
    nearestPentagon,
    pentagonDistance: distance,
    resourceValue,
    numberValue
  };
}

// Get weight for each resource type
function getResourceWeight(resource: string): number {
  const weights: Record<string, number> = {
    'wood': 1.0,
    'brick': 1.0,
    'sheep': 0.8,
    'wheat': 1.2,
    'ore': 1.3
  };
  return weights[resource] || 0;
}

// Get probability value for dice numbers
function getNumberProbability(number: number): number {
  const probabilities: Record<number, number> = {
    2: 1, 3: 2, 4: 3, 5: 4, 6: 5,
    8: 5, 9: 4, 10: 3, 11: 2, 12: 1
  };
  return probabilities[number] || 0;
}

// Find nearest pentagon to a vertex
function findNearestPentagon(game: GameState, vertex: Vertex): { nearestPentagon: string; distance: number } {
  let nearestPentagon = '';
  let minDistance = Infinity;
  
  for (const [faceId, face] of game.faces) {
    if (face.type === 'pentagon') {
      const distance = geodesicDistance(vertex.position, face.position);
      if (distance < minDistance) {
        minDistance = distance;
        nearestPentagon = faceId;
      }
    }
  }
  
  return { nearestPentagon, distance: minDistance };
}

// Check if two vertices are too close for setup
function areVerticesTooClose(game: GameState, v1Id: string, v2Id: string): boolean {
  const v1 = game.vertices.get(v1Id);
  const v2 = game.vertices.get(v2Id);
  if (!v1 || !v2) return false;
  
  // Check if they share an edge (adjacent vertices)
  for (const edge of game.edges.values()) {
    if ((edge.vertices[0] === v1Id && edge.vertices[1] === v2Id) ||
        (edge.vertices[0] === v2Id && edge.vertices[1] === v1Id)) {
      return true;
    }
  }
  
  // Also check geodesic distance
  const distance = geodesicDistance(v1.position, v2.position);
  return distance < 0.15; // Minimum separation
}

// Get region identifier for a vertex (for distribution)
function getVertexRegion(game: GameState, vertexId: string): string {
  const vertex = game.vertices.get(vertexId);
  if (!vertex) return '';
  
  // Simple region based on position angle
  const angle = Math.atan2(vertex.position.y, vertex.position.x);
  const region = Math.floor((angle + Math.PI) / (Math.PI / 4));
  return `region_${region}`;
}

// Execute setup phase for all players
export function executeSetupPhase(game: GameState): void {
  const optimalPlacements = getOptimalStartingPositions(game);
  const playerCount = game.players.size;
  
  console.log('=== SETUP PHASE ===');
  console.log('Each player places 2 settlements and 2 roads\n');
  
  // First round: forward order (1, 2, 3, 4)
  for (let player = 1; player <= playerCount; player++) {
    const placement = optimalPlacements[player - 1][0];
    placeInitialSettlement(game, player, placement);
  }
  
  // Second round: reverse order (4, 3, 2, 1)
  for (let player = playerCount; player >= 1; player--) {
    const placement = optimalPlacements[player - 1][1];
    placeInitialSettlement(game, player, placement);
    
    // Second settlement generates starting resources
    generateStartingResources(game, player, placement.vertex);
  }
  
  console.log('\n=== SETUP COMPLETE ===');
  
  // Show starting positions
  for (let player = 1; player <= playerCount; player++) {
    const vp = calculateVictoryPoints(game, player);
    const resources = game.players.get(player)!.resources;
    console.log(`Player ${player}: ${vp} VP, Resources:`, resources);
  }
  
  // Transition to main game
  game.phase = 'rolling';
  game.turn = 1;
  game.currentPlayer = 1;
}

// Place a settlement during setup
function placeInitialSettlement(
  game: GameState,
  playerId: number,
  placement: OptimalPlacement
): void {
  // Place settlement
  const result = buildSettlement(game, placement.vertex, playerId, true);
  
  // Find best edge for road
  const edges = Array.from(game.edges.values()).filter(edge =>
    edge.vertices.includes(placement.vertex)
  );
  
  if (edges.length > 0) {
    // Pick edge that points toward nearest pentagon
    let bestEdge = edges[0];
    let minPentDist = Infinity;
    
    for (const edge of edges) {
      const otherVertexId = edge.vertices.find(v => v !== placement.vertex)!;
      const otherVertex = game.vertices.get(otherVertexId);
      if (otherVertex) {
        const { distance } = findNearestPentagon(game, otherVertex);
        if (distance < minPentDist) {
          minPentDist = distance;
          bestEdge = edge;
        }
      }
    }
    
    buildRoad(game, bestEdge.id, playerId, true);
  }
  
  console.log(`Player ${playerId} placed settlement at ${placement.vertex} (nearest pentagon: ${placement.nearestPentagon} at distance ${placement.pentagonDistance.toFixed(2)})`);
}

// Generate starting resources from second settlement
function generateStartingResources(
  game: GameState,
  playerId: number,
  vertexId: string
): void {
  const vertex = game.vertices.get(vertexId);
  if (!vertex) return;
  
  const player = game.players.get(playerId)!;
  
  for (const faceId of vertex.faces) {
    const face = game.faces.get(faceId);
    if (face?.type === 'hexagon') {
      const hex = face as any;
      if (hex.resource) {
        player.resources[hex.resource] += 1;
      }
    }
  }
}

// Helper function for geodesic distance
function geodesicDistance(p1: any, p2: any): number {
  const dot = p1.x * p2.x + p1.y * p2.y + p1.z * p2.z;
  return Math.acos(Math.max(-1, Math.min(1, dot)));
}