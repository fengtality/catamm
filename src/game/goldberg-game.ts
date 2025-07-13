// Core game mechanics for Goldberg Polyhedron CATAMM

import { Resource } from '@/types';

// Game constants
export const VICTORY_POINTS_TO_WIN = 10;
export const AMM_INITIAL_LIQUIDITY = 100;
export const AMM_FEE_PERCENT = 0.05;
export const AMM_FEE_CITY_PERCENT = 0.025;
export const PENTAGON_COUNT = 12; // Always 12 pentagons in any Goldberg polyhedron

// Configurable polyhedron sizes
export const POLYHEDRON_SIZES = {
  small: { hexagons: 80, deserts: 4 },    // GP(1,2) approximation
  medium: { hexagons: 180, deserts: 9 },  // GP(1,4) 
  large: { hexagons: 320, deserts: 16 },  // GP(2,3) approximation
  huge: { hexagons: 500, deserts: 25 }    // GP(1,9) approximation
};

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
  port: {
    resource1: Resource;
    resource2: Resource;
    pool: AMMPool;
    activated: boolean;
    owner?: number; // Player who first activated it
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
  k: number; // Constant product
  totalFees: number;
  liquidityProviders: Map<number, number>; // player -> share
}

export interface Player {
  id: number;
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
  polyhedronSize: keyof typeof POLYHEDRON_SIZES;
  remainingDeserts: number;
}

// Core game functions

export function initializeGame(
  playerCount: number, 
  polyhedronSize: keyof typeof POLYHEDRON_SIZES = 'medium'
): GameState {
  if (playerCount < 4) {
    throw new Error('Minimum 4 players required for Goldberg CATAMM');
  }
  
  const config = POLYHEDRON_SIZES[polyhedronSize];

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

  // Place 12 pentagons equidistantly around the board with pre-configured ports
  const pentagonPositions = generatePentagonPositions();
  const pentagonResources = generatePentagonResourcePairs(hexPositions, resources);
  
  pentagonPositions.forEach((pos, index) => {
    const resourcePair = pentagonResources[index];
    const pentagon: Pentagon = {
      id: `pent_${index}`,
      type: FaceType.Pentagon,
      position: normalizePosition(pos),
      neighbors: [],
      port: {
        resource1: resourcePair[0],
        resource2: resourcePair[1],
        pool: {
          resource1Amount: 0,
          resource2Amount: 0,
          k: 0,
          totalFees: 0,
          liquidityProviders: new Map()
        },
        activated: false
      }
    };
    faces.set(pentagon.id, pentagon);
  });

  // Update pentagon neighbors
  updatePentagonNeighbors(faces);

  // Initialize players
  for (let i = 1; i <= playerCount; i++) {
    const player: Player = {
      id: i,
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

  // Calculate remaining deserts after initial board
  const initialDeserts = resources.filter(r => r === null).length;
  const remainingDeserts = config.deserts - initialDeserts;

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
    activePentagons: 0,
    polyhedronSize,
    remainingDeserts
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

// Generate resource pairs for pentagon ports based on board distribution
function generatePentagonResourcePairs(
  hexPositions: Position3D[],
  resources: (Resource | null)[]
): [Resource, Resource][] {
  const pairs: [Resource, Resource][] = [];
  const availableResources = [Resource.Wood, Resource.Brick, Resource.Sheep, Resource.Wheat, Resource.Ore];
  
  // Create diverse pairs ensuring all resources are represented
  for (let i = 0; i < PENTAGON_COUNT; i++) {
    const r1 = availableResources[i % 5];
    const r2 = availableResources[(i + 1 + Math.floor(i / 5)) % 5];
    pairs.push([r1, r2]);
  }
  
  // Shuffle for variety
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }
  
  return pairs;
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
  const config = POLYHEDRON_SIZES[game.polyhedronSize];
  
  if (game.discoveredHexagons >= config.hexagons) {
    return null;
  }

  // Determine if this should be a desert
  const totalHexagons = config.hexagons;
  const discoveredRatio = game.discoveredHexagons / totalHexagons;
  const desertsRatio = (config.deserts - game.remainingDeserts) / config.deserts;
  
  // Higher chance of desert if we're behind on placing them
  const desertChance = game.remainingDeserts > 0 ? 
    Math.max(0.05, (game.remainingDeserts / (totalHexagons - game.discoveredHexagons)) * 1.5) : 0;
  
  const isDesert = game.remainingDeserts > 0 && Math.random() < desertChance;
  
  // Generate new hexagon
  const resources = [Resource.Wood, Resource.Brick, Resource.Sheep, Resource.Wheat, Resource.Ore];
  
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
  
  if (isDesert) {
    game.remainingDeserts--;
  }
  
  return newHex;
}

export function activatePentagon(game: GameState, pentagon: Pentagon, player: number): void {
  if (pentagon.port.activated) {
    return; // Already activated
  }

  // Initialize the AMM pool with liquidity
  pentagon.port.pool = {
    resource1Amount: AMM_INITIAL_LIQUIDITY,
    resource2Amount: AMM_INITIAL_LIQUIDITY,
    k: AMM_INITIAL_LIQUIDITY * AMM_INITIAL_LIQUIDITY,
    totalFees: 0,
    liquidityProviders: new Map([[player, 1.0]]) // Port owner starts with 100%
  };

  pentagon.port.activated = true;
  pentagon.port.owner = player;

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
  inputAmount: number
): { outputResource: Resource; outputAmount: number } | null {
  const pentagon = game.faces.get(pentagonId) as Pentagon;
  if (!pentagon?.port || !pentagon.port.activated) return null;

  const { pool, resource1, resource2 } = pentagon.port;
  const playerData = game.players.get(player)!;
  
  // Must trade between the two resources of this port
  if (inputResource !== resource1 && inputResource !== resource2) return null;
  if (playerData.resources[inputResource] < inputAmount) return null;
  
  const outputResource = inputResource === resource1 ? resource2 : resource1;
  
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

  // Get current pool amounts
  const inputPoolAmount = inputResource === resource1 ? pool.resource1Amount : pool.resource2Amount;
  const outputPoolAmount = outputResource === resource1 ? pool.resource1Amount : pool.resource2Amount;

  // Calculate output based on constant product formula: x * y = k
  const newInputAmount = inputPoolAmount + inputAfterFee;
  const newOutputAmount = pool.k / newInputAmount;
  const outputAmount = outputPoolAmount - newOutputAmount;

  // Update pool
  if (inputResource === resource1) {
    pool.resource1Amount = newInputAmount;
    pool.resource2Amount = newOutputAmount;
  } else {
    pool.resource2Amount = newInputAmount;
    pool.resource1Amount = newOutputAmount;
  }

  // Update player resources
  playerData.resources[inputResource] -= inputAmount;
  playerData.resources[outputResource] += Math.floor(outputAmount);

  // Track fees for liquidity providers
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