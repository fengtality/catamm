// Building and road placement logic for Goldberg CATAMM

import {
  GameState,
  Vertex,
  Edge,
  BuildingType,
  Face,
  FaceType,
  Pentagon,
  discoverHexagon,
  activatePentagon
} from './goldberg-game';

export interface BuildResult {
  success: boolean;
  message: string;
  discoveredHexagons?: string[];
  activatedPentagon?: string;
}

export function canBuildSettlement(
  game: GameState,
  vertexId: string,
  playerId: number,
  isSetupPhase: boolean = false
): boolean {
  const vertex = game.vertices.get(vertexId);
  if (!vertex) return false;
  
  // Check if vertex already has a building
  if (vertex.building) return false;
  
  // Check distance rule (no settlements on adjacent vertices)
  for (const edgeId of game.edges.keys()) {
    const edge = game.edges.get(edgeId)!;
    if (edge.vertices.includes(vertexId)) {
      const otherVertexId = edge.vertices.find(v => v !== vertexId)!;
      const otherVertex = game.vertices.get(otherVertexId);
      if (otherVertex?.building) return false;
    }
  }
  
  // During setup phase, no road requirement
  if (isSetupPhase) return true;
  
  // Check if player has an adjacent road
  return hasAdjacentRoad(game, vertexId, playerId);
}

export function buildSettlement(
  game: GameState,
  vertexId: string,
  playerId: number,
  isSetupPhase: boolean = false
): BuildResult {
  if (!canBuildSettlement(game, vertexId, playerId, isSetupPhase)) {
    return { success: false, message: 'Cannot build settlement at this location' };
  }
  
  const vertex = game.vertices.get(vertexId)!;
  const player = game.players.get(playerId)!;
  
  // Place settlement
  vertex.building = {
    type: BuildingType.Settlement,
    player: playerId
  };
  player.victoryPoints.settlements++;
  
  const result: BuildResult = {
    success: true,
    message: 'Settlement built successfully'
  };
  
  // Check if this triggers hex discovery
  const discoveredHexes = checkAndDiscoverHexagons(game, vertex);
  if (discoveredHexes.length > 0) {
    result.discoveredHexagons = discoveredHexes.map(h => h.id);
    result.message += ` and discovered ${discoveredHexes.length} new hexagon(s)`;
  }
  
  // Check if this activates a pentagon port
  const activatedPentagon = checkAndActivatePentagon(game, vertex, playerId);
  if (activatedPentagon) {
    result.activatedPentagon = activatedPentagon.id;
    result.message += ' and activated a pentagon port';
  }
  
  return result;
}

export function canBuildCity(
  game: GameState,
  vertexId: string,
  playerId: number
): boolean {
  const vertex = game.vertices.get(vertexId);
  if (!vertex) return false;
  
  // Must have a settlement owned by the player
  return vertex.building?.type === BuildingType.Settlement &&
         vertex.building.player === playerId;
}

export function buildCity(
  game: GameState,
  vertexId: string,
  playerId: number
): BuildResult {
  if (!canBuildCity(game, vertexId, playerId)) {
    return { success: false, message: 'Cannot upgrade to city at this location' };
  }
  
  const vertex = game.vertices.get(vertexId)!;
  const player = game.players.get(playerId)!;
  
  // Upgrade to city
  vertex.building!.type = BuildingType.City;
  player.victoryPoints.settlements--;
  player.victoryPoints.cities++;
  
  return {
    success: true,
    message: 'Settlement upgraded to city'
  };
}

export function canBuildRoad(
  game: GameState,
  edgeId: string,
  playerId: number,
  isSetupPhase: boolean = false
): boolean {
  const edge = game.edges.get(edgeId);
  if (!edge) return false;
  
  // Check if edge already has a road
  if (edge.road) return false;
  
  // During setup, must connect to the settlement just placed
  if (isSetupPhase) {
    return edge.vertices.some(vId => {
      const vertex = game.vertices.get(vId);
      return vertex?.building?.player === playerId;
    });
  }
  
  // Must connect to player's existing road network or building
  return edge.vertices.some(vId => {
    const vertex = game.vertices.get(vId);
    // Check for player's building
    if (vertex?.building?.player === playerId) return true;
    
    // Check for connecting roads
    return Array.from(game.edges.values()).some(e => 
      e.road?.player === playerId && 
      e.id !== edgeId &&
      e.vertices.some(v => v === vId)
    );
  });
}

export function buildRoad(
  game: GameState,
  edgeId: string,
  playerId: number,
  isSetupPhase: boolean = false
): BuildResult {
  if (!canBuildRoad(game, edgeId, playerId, isSetupPhase)) {
    return { success: false, message: 'Cannot build road at this location' };
  }
  
  const edge = game.edges.get(edgeId)!;
  const player = game.players.get(playerId)!;
  
  // Place road
  edge.road = { player: playerId };
  
  // Update longest road calculation
  updateLongestRoad(game);
  
  return {
    success: true,
    message: 'Road built successfully'
  };
}

// Helper functions

function hasAdjacentRoad(
  game: GameState,
  vertexId: string,
  playerId: number
): boolean {
  return Array.from(game.edges.values()).some(edge =>
    edge.road?.player === playerId && edge.vertices.includes(vertexId)
  );
}

function checkAndDiscoverHexagons(
  game: GameState,
  vertex: Vertex
): Face[] {
  const discovered: Face[] = [];
  
  // Check if vertex is on the edge of explored territory
  const emptySpaceCount = 3 - vertex.faces.length;
  if (emptySpaceCount > 0) {
    // Generate positions for new hexagons
    // This is simplified - real implementation would calculate proper positions
    for (let i = 0; i < Math.min(emptySpaceCount, 2); i++) {
      const angle = Math.random() * Math.PI * 2;
      const position = {
        x: vertex.position.x + Math.cos(angle) * 0.1,
        y: vertex.position.y + Math.sin(angle) * 0.1,
        z: vertex.position.z - 0.05
      };
      
      const newHex = discoverHexagon(game, position);
      if (newHex) {
        discovered.push(newHex);
        vertex.faces.push(newHex.id);
        
        // Update vertex connections for the new hex
        updateVertexConnections(game, newHex);
      }
    }
  }
  
  return discovered;
}

function checkAndActivatePentagon(
  game: GameState,
  vertex: Vertex,
  playerId: number
): Pentagon | null {
  // Check if any adjacent face is an unactivated pentagon
  for (const faceId of vertex.faces) {
    const face = game.faces.get(faceId);
    if (face?.type === FaceType.Pentagon) {
      const pentagon = face as Pentagon;
      if (!pentagon.port) {
        activatePentagon(game, pentagon, playerId);
        return pentagon;
      }
    }
  }
  return null;
}

function updateVertexConnections(game: GameState, newHex: Face): void {
  // This is a simplified version
  // Real implementation would properly calculate shared vertices with neighbors
  
  // Find vertices that should be shared with neighboring hexes
  for (const neighborId of newHex.neighbors) {
    const neighbor = game.faces.get(neighborId);
    if (neighbor) {
      // Find or create shared vertices
      // This would involve complex geometric calculations
    }
  }
}

function updateLongestRoad(game: GameState): void {
  let longestRoadPlayer = 0;
  let longestRoadLength = 0;
  
  // Calculate longest road for each player
  for (const [playerId, player] of game.players) {
    const roadLength = calculatePlayerRoadLength(game, playerId);
    player.longestRoadLength = roadLength;
    
    if (roadLength >= 5 && roadLength > longestRoadLength) {
      longestRoadLength = roadLength;
      longestRoadPlayer = playerId;
    }
  }
  
  // Update longest road bonus
  for (const [playerId, player] of game.players) {
    player.victoryPoints.longestRoad = (playerId === longestRoadPlayer && longestRoadLength >= 5);
  }
}

function calculatePlayerRoadLength(game: GameState, playerId: number): number {
  // Simplified calculation - real implementation would use graph traversal
  const playerRoads = Array.from(game.edges.values()).filter(e => e.road?.player === playerId);
  
  // For now, just return the count
  // Real implementation would find the longest continuous path
  return playerRoads.length;
}

// Largest army calculation
export function updateLargestArmy(game: GameState): void {
  let largestArmyPlayer = 0;
  let largestArmySize = 0;
  
  for (const [playerId, player] of game.players) {
    if (player.knightsPlayed >= 3 && player.knightsPlayed > largestArmySize) {
      largestArmySize = player.knightsPlayed;
      largestArmyPlayer = playerId;
    }
  }
  
  // Update largest army bonus
  for (const [playerId, player] of game.players) {
    player.victoryPoints.largestArmy = (playerId === largestArmyPlayer && largestArmySize >= 3);
  }
}