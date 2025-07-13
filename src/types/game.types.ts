// Core game type definitions for CATAMM

export enum Resource {
  Wood = 'Wood',
  Brick = 'Brick',
  Sheep = 'Sheep',
  Wheat = 'Wheat',
  Ore = 'Ore'
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
  market: MarketPair;
  resourceA: Resource;
  resourceB: Resource;
  reserveA: number;
  reserveB: number;
  isActive: boolean;
  k: number; // Constant product
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