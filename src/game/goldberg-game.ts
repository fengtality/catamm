// Core game mechanics for Goldberg Polyhedron CATAMM

import { Resource } from '@/types';

// Game constants
export const VICTORY_POINTS_TO_WIN = 10;
export const STARTING_SOL = 1000;
export const AMM_INITIAL_LIQUIDITY = 100;
export const AMM_FEE_PERCENT = 0.05;
export const AMM_FEE_CITY_PERCENT = 0.025;
export const MAX_HEXAGONS = 180;
export const PENTAGON_COUNT = 12;

// Enums
export enum FaceType {
  Pentagon = 'pentagon',
  Hexagon = 'hexagon',
  Empty = 'empty' // Undiscovered space
}

export enum BuildingType {
  Settlement = 'settlement',
  City = 'city',
  Road = 'road'
}

export enum DevelopmentCard {
  Knight = 'knight',
  VictoryPoint = 'victory_point',
  RoadBuilding = 'road_building',
  Discovery = 'discovery',
  Monopoly = 'monopoly'
}

// Interfaces
export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface Face {
  id: string;
  type: FaceType;
  position: Position3D;
  resource?: Resource;
  numberToken?: number;
  hasRobber?: boolean;
  neighbors: string[]; // Face IDs
}

export interface Pentagon extends Face {
  type: FaceType.Pentagon;
  port?: {
    resource1: Resource;
    resource2: Resource;
    owner: number; // Player who activated it
    pool: AMMPool;
  };
}

export interface Hexagon extends Face {
  type: FaceType.Hexagon;
  resource: Resource | null; // null for desert
  numberToken: number | null;
  hasRobber: boolean;
}

export interface Vertex {
  id: string;
  position: Position3D;
  faces: string[]; // Face IDs this vertex touches
  building?: {
    type: BuildingType.Settlement | BuildingType.City;
    player: number;
  };
}

export interface Edge {
  id: string;
  vertices: [string, string];
  road?: {
    player: number;
  };
}

export interface AMMPool {
  resource1Amount: number;
  resource2Amount: number;
  solAmount: number;
  k: number; // Constant product
  totalFees: number;
  liquidityProviders: Map<number, number>; // player -> share
}

export interface Player {
  id: number;
  sol: number;
  resources: Record<Resource, number>;
  developmentCards: DevelopmentCard[];
  knightsPlayed: number;
  longestRoadLength: number;
  victoryPoints: {
    settlements: number;
    cities: number;
    longestRoad: boolean;
    largestArmy: boolean;
    firstPort: boolean;
    hiddenCards: number;
    special: number;
  };
}

export interface GameState {
  turn: number;
  currentPlayer: number;
  phase: 'setup' | 'rolling' | 'building' | 'trading';
  faces: Map<string, Face>;
  vertices: Map<string, Vertex>;
  edges: Map<string, Edge>;
  players: Map<number, Player>;
  lastDiceRoll: [number, number];
  robberLocation: string | null;
  discoveredHexagons: number;
  activePentagons: number;
}

// Core game functions

export function initializeGame(playerCount: number): GameState {
  if (playerCount < 4) {
    throw new Error('Minimum 4 players required for Goldberg CATAMM');
  }

  const faces = new Map<string, Face>();
  const vertices = new Map<string, Vertex>();
  const edges = new Map<string, Edge>();
  const players = new Map<number, Player>();

  // Create standard 19-hex Catan board in hex pattern
  const hexPositions = generateStandardBoardPositions();
  const resources = shuffleResources();
  const numbers = shuffleNumbers();
  let desertIndex = -1;

  // Create hexagons
  hexPositions.forEach((pos, index) => {
    const isDesert = resources[index] === null;
    if (isDesert) desertIndex = index;
    
    const hex: Hexagon = {
      id: `hex_${index}`,
      type: FaceType.Hexagon,
      position: normalizePosition(pos),
      resource: resources[index],
      numberToken: isDesert ? null : numbers.pop()!,
      hasRobber: isDesert,
      neighbors: []
    };
    faces.set(hex.id, hex);
  });

  // Set up neighbor relationships
  updateNeighborRelationships(faces);

  // Create vertices and edges for the hex cluster
  createVerticesAndEdges(faces, vertices, edges);

  // Place 12 pentagons equidistantly around the board
  const pentagonPositions = generatePentagonPositions();
  pentagonPositions.forEach((pos, index) => {
    const pentagon: Pentagon = {
      id: `pent_${index}`,
      type: FaceType.Pentagon,
      position: normalizePosition(pos),
      neighbors: []
    };
    faces.set(pentagon.id, pentagon);
  });

  // Update pentagon neighbors
  updatePentagonNeighbors(faces);

  // Initialize players
  for (let i = 1; i <= playerCount; i++) {
    const player: Player = {
      id: i,
      sol: STARTING_SOL,
      resources: {
        [Resource.Wood]: 0,
        [Resource.Brick]: 0,
        [Resource.Sheep]: 0,
        [Resource.Wheat]: 0,
        [Resource.Ore]: 0
      },
      developmentCards: [],
      knightsPlayed: 0,
      longestRoadLength: 0,
      victoryPoints: {
        settlements: 0,
        cities: 0,
        longestRoad: false,
        largestArmy: false,
        firstPort: false,
        hiddenCards: 0,
        special: 0
      }
    };
    players.set(i, player);
  }

  return {
    turn: 1,
    currentPlayer: 1,
    phase: 'setup',
    faces,
    vertices,
    edges,
    players,
    lastDiceRoll: [0, 0],
    robberLocation: `hex_${desertIndex}`,
    discoveredHexagons: 19,
    activePentagons: 0
  };
}

// Generate positions for standard 19-hex board
function generateStandardBoardPositions(): Position3D[] {
  const positions: Position3D[] = [];
  const hexRadius = 0.1; // Radius on sphere surface
  
  // Center hex
  positions.push({ x: 0, y: 0, z: 1 });
  
  // First ring (6 hexes)
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI * 2) / 6;
    positions.push({
      x: Math.sin(hexRadius) * Math.cos(angle),
      y: Math.sin(hexRadius) * Math.sin(angle),
      z: Math.cos(hexRadius)
    });
  }
  
  // Second ring (12 hexes)
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI * 2) / 12 + Math.PI / 12;
    const radius = hexRadius * 1.8;
    positions.push({
      x: Math.sin(radius) * Math.cos(angle),
      y: Math.sin(radius) * Math.sin(angle),
      z: Math.cos(radius)
    });
  }
  
  return positions;
}

// Shuffle resources for standard Catan distribution
function shuffleResources(): (Resource | null)[] {
  const resources: (Resource | null)[] = [
    ...Array(4).fill(Resource.Wood),
    ...Array(3).fill(Resource.Brick),
    ...Array(4).fill(Resource.Sheep),
    ...Array(4).fill(Resource.Wheat),
    ...Array(3).fill(Resource.Ore),
    null // Desert
  ];
  
  // Fisher-Yates shuffle
  for (let i = resources.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [resources[i], resources[j]] = [resources[j], resources[i]];
  }
  
  return resources;
}

// Shuffle number tokens (no 7)
function shuffleNumbers(): number[] {
  const numbers = [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12];
  
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }
  
  return numbers;
}

// Generate 12 pentagon positions equidistant around the board
function generatePentagonPositions(): Position3D[] {
  const positions: Position3D[] = [];
  const pentagonRadius = 0.35; // Further out than hexagons
  
  // Use icosahedral vertices for perfect distribution
  // Simplified: place them in two rings of 6
  
  // Upper ring
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI * 2) / 6;
    const tilt = Math.PI / 6; // 30 degrees from vertical
    positions.push({
      x: Math.sin(pentagonRadius) * Math.cos(angle) * Math.sin(tilt),
      y: Math.sin(pentagonRadius) * Math.sin(angle) * Math.sin(tilt),
      z: Math.cos(pentagonRadius) * Math.cos(tilt)
    });
  }
  
  // Lower ring (offset by 30 degrees)
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI * 2) / 6 + Math.PI / 6;
    const tilt = Math.PI / 3; // 60 degrees from vertical
    positions.push({
      x: Math.sin(pentagonRadius) * Math.cos(angle) * Math.sin(tilt),
      y: Math.sin(pentagonRadius) * Math.sin(angle) * Math.sin(tilt),
      z: Math.cos(pentagonRadius) * Math.cos(tilt)
    });
  }
  
  return positions;
}

// Update neighbor relationships based on distance
function updateNeighborRelationships(faces: Map<string, Face>): void {
  const hexagons = Array.from(faces.values()).filter(f => f.type === FaceType.Hexagon);
  
  hexagons.forEach(hex1 => {
    hexagons.forEach(hex2 => {
      if (hex1.id !== hex2.id) {
        const distance = geodesicDistance(hex1.position, hex2.position);
        if (distance < 0.12) { // Adjacent hexagons
          if (!hex1.neighbors.includes(hex2.id)) {
            hex1.neighbors.push(hex2.id);
          }
        }
      }
    });
  });
}

// Create vertices and edges for the hex cluster
function createVerticesAndEdges(
  faces: Map<string, Face>,
  vertices: Map<string, Vertex>,
  edges: Map<string, Edge>
): void {
  // This is simplified - in reality would calculate proper shared vertices
  let vertexId = 0;
  let edgeId = 0;
  
  // For each hexagon, create vertices
  Array.from(faces.values())
    .filter(f => f.type === FaceType.Hexagon)
    .forEach((hex, hexIndex) => {
      // Create 6 vertices for each hex (simplified - doesn't share vertices yet)
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI * 2) / 6;
        const vertexRadius = 0.05;
        
        // Calculate vertex position relative to hex center
        const vx = hex.position.x + vertexRadius * Math.cos(angle);
        const vy = hex.position.y + vertexRadius * Math.sin(angle);
        const vz = hex.position.z - 0.01;
        
        const vertex: Vertex = {
          id: `v_${vertexId++}`,
          position: normalizePosition({ x: vx, y: vy, z: vz }),
          faces: [hex.id]
        };
        vertices.set(vertex.id, vertex);
      }
    });
  
  // Create edges (simplified)
  vertices.forEach((v1, id1) => {
    vertices.forEach((v2, id2) => {
      if (id1 < id2) { // Avoid duplicates
        const distance = geodesicDistance(v1.position, v2.position);
        if (distance < 0.06) { // Adjacent vertices
          const edge: Edge = {
            id: `e_${edgeId++}`,
            vertices: [id1, id2]
          };
          edges.set(edge.id, edge);
        }
      }
    });
  });
}

// Update pentagon neighbors to include nearby hexagons
function updatePentagonNeighbors(faces: Map<string, Face>): void {
  const pentagons = Array.from(faces.values()).filter(f => f.type === FaceType.Pentagon);
  const hexagons = Array.from(faces.values()).filter(f => f.type === FaceType.Hexagon);
  
  pentagons.forEach(pentagon => {
    // Find 5 nearest hexagons
    const distances = hexagons.map(hex => ({
      hex,
      distance: geodesicDistance(pentagon.position, hex.position)
    }));
    
    distances.sort((a, b) => a.distance - b.distance);
    pentagon.neighbors = distances.slice(0, 5).map(d => d.hex.id);
  });
}

export function rollDice(game: GameState): [number, number] {
  const die1 = Math.floor(Math.random() * 6) + 1;
  const die2 = Math.floor(Math.random() * 6) + 1;
  game.lastDiceRoll = [die1, die2];
  
  const sum = die1 + die2;
  if (sum === 7) {
    // Robber activation
    game.phase = 'building'; // Need to move robber
  } else {
    // Generate resources
    generateResources(game, sum);
  }
  
  return [die1, die2];
}

export function generateResources(game: GameState, diceSum: number): void {
  // Find all hexagons with the rolled number
  for (const face of game.faces.values()) {
    if (face.type === FaceType.Hexagon) {
      const hex = face as Hexagon;
      if (hex.numberToken === diceSum && !hex.hasRobber) {
        // Find all settlements/cities adjacent to this hex
        for (const vertex of game.vertices.values()) {
          if (vertex.faces.includes(hex.id) && vertex.building) {
            const player = game.players.get(vertex.building.player)!;
            const amount = vertex.building.type === BuildingType.City ? 2 : 1;
            if (hex.resource) {
              player.resources[hex.resource] += amount;
            }
          }
        }
      }
    }
  }
}

export function discoverHexagon(game: GameState, position: Position3D): Hexagon | null {
  if (game.discoveredHexagons >= MAX_HEXAGONS) {
    return null;
  }

  // Generate new hexagon
  const resources = [Resource.Wood, Resource.Brick, Resource.Sheep, Resource.Wheat, Resource.Ore];
  const isDesert = Math.random() < 0.05; // 5% chance of desert
  
  const newHex: Hexagon = {
    id: `hex_${game.discoveredHexagons}`,
    type: FaceType.Hexagon,
    position: normalizePosition(position),
    resource: isDesert ? null : resources[Math.floor(Math.random() * resources.length)],
    numberToken: isDesert ? null : generateNumberToken(),
    hasRobber: false,
    neighbors: []
  };

  // Find neighbors
  for (const [id, face] of game.faces) {
    if (geodesicDistance(face.position, newHex.position) < 0.3) {
      newHex.neighbors.push(id);
      face.neighbors.push(newHex.id);
    }
  }

  game.faces.set(newHex.id, newHex);
  game.discoveredHexagons++;
  
  return newHex;
}

export function activatePentagon(game: GameState, pentagon: Pentagon, player: number): void {
  // Get adjacent hexagons
  const adjacentHexagons = pentagon.neighbors
    .map(id => game.faces.get(id))
    .filter(face => face?.type === FaceType.Hexagon) as Hexagon[];
  
  // Get resources from adjacent hexagons
  const adjacentResources = adjacentHexagons
    .map(hex => hex.resource)
    .filter(r => r !== null) as Resource[];
  
  if (adjacentResources.length < 2) {
    return; // Not enough resources to create trading pair
  }

  // Randomly select 2 resources
  const shuffled = [...adjacentResources].sort(() => Math.random() - 0.5);
  const resource1 = shuffled[0];
  const resource2 = shuffled[1];

  // Create AMM pool
  const pool: AMMPool = {
    resource1Amount: AMM_INITIAL_LIQUIDITY,
    resource2Amount: AMM_INITIAL_LIQUIDITY,
    solAmount: AMM_INITIAL_LIQUIDITY * 2,
    k: AMM_INITIAL_LIQUIDITY * AMM_INITIAL_LIQUIDITY,
    totalFees: 0,
    liquidityProviders: new Map([[player, 1.0]]) // Port owner starts with 100%
  };

  pentagon.port = {
    resource1,
    resource2,
    owner: player,
    pool
  };

  // Award first port bonus if applicable
  const playerData = game.players.get(player)!;
  if (game.activePentagons === 0) {
    playerData.victoryPoints.firstPort = true;
  }

  game.activePentagons++;
}

export function tradeWithAMM(
  game: GameState,
  pentagonId: string,
  player: number,
  inputResource: Resource,
  inputAmount: number,
  isInputSol: boolean
): { outputResource: Resource | 'sol'; outputAmount: number } | null {
  const pentagon = game.faces.get(pentagonId) as Pentagon;
  if (!pentagon?.port) return null;

  const { pool, resource1, resource2 } = pentagon.port;
  const playerData = game.players.get(player)!;
  
  // Determine if player has city on this pentagon for reduced fees
  const hasCityOnPentagon = Array.from(game.vertices.values()).some(
    v => v.faces.includes(pentagonId) && 
         v.building?.player === player && 
         v.building.type === BuildingType.City
  );
  const feeRate = hasCityOnPentagon ? AMM_FEE_CITY_PERCENT : AMM_FEE_PERCENT;

  // Apply fee to input
  const inputAfterFee = inputAmount * (1 - feeRate);
  const fee = inputAmount * feeRate;

  // Calculate output based on constant product formula
  let outputAmount: number;
  let outputResource: Resource | 'sol';

  if (isInputSol) {
    // Trading SOL for resources
    if (playerData.sol < inputAmount) return null;
    
    // Simplified: assume equal SOL value for both resources
    const resourceToTrade = Math.random() < 0.5 ? resource1 : resource2;
    const currentResourceAmount = resourceToTrade === resource1 ? 
      pool.resource1Amount : pool.resource2Amount;
    
    outputAmount = (currentResourceAmount * inputAfterFee) / 
      (pool.solAmount + inputAfterFee);
    outputResource = resourceToTrade;
    
    // Update pool
    if (resourceToTrade === resource1) {
      pool.resource1Amount -= outputAmount;
    } else {
      pool.resource2Amount -= outputAmount;
    }
    pool.solAmount += inputAfterFee;
    
    // Update player
    playerData.sol -= inputAmount;
    playerData.resources[outputResource] += Math.floor(outputAmount);
  } else {
    // Trading resources for SOL or other resource
    if (inputResource !== resource1 && inputResource !== resource2) return null;
    if (playerData.resources[inputResource] < inputAmount) return null;
    
    // For simplicity, trade for SOL
    const currentResourceAmount = inputResource === resource1 ? 
      pool.resource1Amount : pool.resource2Amount;
    
    outputAmount = (pool.solAmount * inputAfterFee) / 
      (currentResourceAmount + inputAfterFee);
    outputResource = 'sol';
    
    // Update pool
    if (inputResource === resource1) {
      pool.resource1Amount += inputAfterFee;
    } else {
      pool.resource2Amount += inputAfterFee;
    }
    pool.solAmount -= outputAmount;
    
    // Update player
    playerData.resources[inputResource] -= inputAmount;
    playerData.sol += Math.floor(outputAmount);
  }

  // Distribute fees
  pool.totalFees += fee;
  
  return {
    outputResource,
    outputAmount: Math.floor(outputAmount)
  };
}

export function calculateVictoryPoints(game: GameState, playerId: number): number {
  const player = game.players.get(playerId)!;
  const vp = player.victoryPoints;
  
  return vp.settlements + 
         vp.cities * 2 + 
         (vp.longestRoad ? 2 : 0) + 
         (vp.largestArmy ? 2 : 0) + 
         (vp.firstPort ? 1 : 0) + 
         vp.hiddenCards + 
         vp.special;
}

export function checkWinCondition(game: GameState): number | null {
  for (const [playerId, player] of game.players) {
    if (calculateVictoryPoints(game, playerId) >= VICTORY_POINTS_TO_WIN) {
      return playerId;
    }
  }
  return null;
}

// Helper functions
function normalizePosition(pos: Position3D): Position3D {
  const length = Math.sqrt(pos.x ** 2 + pos.y ** 2 + pos.z ** 2);
  return {
    x: pos.x / length,
    y: pos.y / length,
    z: pos.z / length
  };
}

function geodesicDistance(p1: Position3D, p2: Position3D): number {
  // Dot product for unit vectors gives cos(angle)
  const dot = p1.x * p2.x + p1.y * p2.y + p1.z * p2.z;
  return Math.acos(Math.max(-1, Math.min(1, dot)));
}

function generateNumberToken(): number {
  const distribution = [2, 3, 3, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6, 6,
                       8, 8, 8, 8, 8, 9, 9, 9, 9, 10, 10, 10, 11, 11, 12];
  return distribution[Math.floor(Math.random() * distribution.length)];
}