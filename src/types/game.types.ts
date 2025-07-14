// Core game type definitions for CATAMM

export enum Resource {
  Wood = 'Wood',
  Brick = 'Brick',
  Sheep = 'Sheep',
  Wheat = 'Wheat',
  Ore = 'Ore'
}

// Building costs (standard Catan)
export const BUILDING_COSTS = {
  Settlement: {
    [Resource.Wood]: 1,
    [Resource.Brick]: 1,
    [Resource.Sheep]: 1,
    [Resource.Wheat]: 1,
    [Resource.Ore]: 0
  },
  City: {
    [Resource.Wood]: 0,
    [Resource.Brick]: 0,
    [Resource.Sheep]: 0,
    [Resource.Wheat]: 2,
    [Resource.Ore]: 3
  },
  Road: {
    [Resource.Wood]: 1,
    [Resource.Brick]: 1,
    [Resource.Sheep]: 0,
    [Resource.Wheat]: 0,
    [Resource.Ore]: 0
  }
}

export enum MarketPair {
  WoodBrick = 'Wo-B',
  WoodSheep = 'Wo-S',
  WoodOre = 'Wo-O',
  WoodWheat = 'Wo-Wh',
  BrickSheep = 'B-S',
  BrickOre = 'B-O',
  BrickWheat = 'B-Wh',
  SheepOre = 'S-O',
  SheepWheat = 'S-Wh',
  OreWheat = 'O-Wh'
}

export interface AMMPool {
  id: string; // Unique market ID (e.g., "vertex-123")
  market: MarketPair;
  resourceA: Resource;
  resourceB: Resource;
  reserveA: number;
  reserveB: number;
  isActive: boolean;
  k: number; // Constant product
  owner?: number; // Player who owns the port
  vertexId: string; // The vertex where this market is located
}

export interface Port {
  id: number;
  position: { x: number; y: number };
  market: MarketPair;
  type: 'single' | 'double';
  hexEdges: Array<{
    hexIndex: number;
    edge: EdgeDirection;
  }>;
  owner?: PlayerId;
}

export type EdgeDirection = 'N' | 'NE' | 'E' | 'SE' | 'SW' | 'W' | 'NW';

export interface Hex {
  index: number;
  resource: Resource | null; // null for desert
  number: number | null; // null for desert
  position: { x: number; y: number };
  coordinates: { q: number; r: number }; // Axial coordinates
  hasGhostShip: boolean;
}

export interface Player {
  id: PlayerId;
  name: string;
  resources: Record<Resource, number>;
  settlements: number[];
  cities: number[];
  roads: Edge[];
  developmentCards: DevelopmentCard[];
  knights: number;
  victoryPoints: number;
}

export type PlayerId = 'player1' | 'player2' | 'player3' | 'player4';

export interface Edge {
  id: string;
  vertices: [number, number];
  owner?: PlayerId;
}

export interface Vertex {
  id: number;
  position: { x: number; y: number };
  adjacentHexes: number[];
  building?: {
    type: 'settlement' | 'city';
    owner: PlayerId;
  };
}

export enum DevelopmentCard {
  Knight = 'Knight',
  VictoryPoint = 'VictoryPoint',
  RoadBuilding = 'RoadBuilding',
  YearOfPlenty = 'YearOfPlenty',
  Monopoly = 'Monopoly'
}

export interface GameState {
  board: {
    hexes: Hex[];
    vertices: Vertex[];
    edges: Edge[];
    ports: Port[];
  };
  players: Record<PlayerId, Player>;
  ammPools: Record<MarketPair, AMMPool>;
  currentPlayer: PlayerId;
  dice: [number, number];
  ghostShipLocation: number;
  inactiveMarket: MarketPair;
  turnNumber: number;
  gamePhase: GamePhase;
  winner?: PlayerId;
}

export enum GamePhase {
  Setup = 'Setup',
  Playing = 'Playing',
  Ended = 'Ended'
}

export interface TradeAction {
  player: PlayerId;
  market: MarketPair;
  resourceIn: Resource;
  amountIn: number;
  resourceOut: Resource;
  amountOut: number;
  feeRate: number;
  timestamp: number;
}