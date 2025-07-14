import { AMMPool, MarketPair, Resource, Port } from '@/types/game.types'

// Initialize AMM pools with mock data
export const mockAMMPools: Record<MarketPair, AMMPool> = {
  [MarketPair.WoodBrick]: {
    market: MarketPair.WoodBrick,
    resourceA: Resource.Wood,
    resourceB: Resource.Brick,
    reserveA: 100,
    reserveB: 150,
    isActive: true,
    k: 15000
  },
  [MarketPair.WoodSheep]: {
    market: MarketPair.WoodSheep,
    resourceA: Resource.Wood,
    resourceB: Resource.Sheep,
    reserveA: 80,
    reserveB: 120,
    isActive: true,
    k: 9600
  },
  [MarketPair.WoodOre]: {
    market: MarketPair.WoodOre,
    resourceA: Resource.Wood,
    resourceB: Resource.Ore,
    reserveA: 100,
    reserveB: 100,
    isActive: true,
    k: 10000
  },
  [MarketPair.WoodWheat]: {
    market: MarketPair.WoodWheat,
    resourceA: Resource.Wood,
    resourceB: Resource.Wheat,
    reserveA: 90,
    reserveB: 110,
    isActive: true,
    k: 9900
  },
  [MarketPair.BrickSheep]: {
    market: MarketPair.BrickSheep,
    resourceA: Resource.Brick,
    resourceB: Resource.Sheep,
    reserveA: 120,
    reserveB: 80,
    isActive: true,
    k: 9600
  },
  [MarketPair.BrickOre]: {
    market: MarketPair.BrickOre,
    resourceA: Resource.Brick,
    resourceB: Resource.Ore,
    reserveA: 100,
    reserveB: 100,
    isActive: false, // This is the inactive market
    k: 10000
  },
  [MarketPair.BrickWheat]: {
    market: MarketPair.BrickWheat,
    resourceA: Resource.Brick,
    resourceB: Resource.Wheat,
    reserveA: 110,
    reserveB: 90,
    isActive: true,
    k: 9900
  },
  [MarketPair.SheepOre]: {
    market: MarketPair.SheepOre,
    resourceA: Resource.Sheep,
    resourceB: Resource.Ore,
    reserveA: 150,
    reserveB: 100,
    isActive: true,
    k: 15000
  },
  [MarketPair.SheepWheat]: {
    market: MarketPair.SheepWheat,
    resourceA: Resource.Sheep,
    resourceB: Resource.Wheat,
    reserveA: 100,
    reserveB: 100,
    isActive: true,
    k: 10000
  },
  [MarketPair.OreWheat]: {
    market: MarketPair.OreWheat,
    resourceA: Resource.Ore,
    resourceB: Resource.Wheat,
    reserveA: 80,
    reserveB: 120,
    isActive: true,
    k: 9600
  }
}

// Mock port assignments (these would normally come from board initialization)
export const mockPorts: Port[] = [
  {
    id: 1,
    position: { x: 300, y: 200 },
    market: MarketPair.WoodBrick,
    type: 'single',
    hexEdges: [{ hexIndex: 0, edge: 'N' }],
    owner: undefined
  },
  {
    id: 2,
    position: { x: 400, y: 250 },
    market: MarketPair.WoodSheep,
    type: 'single',
    hexEdges: [{ hexIndex: 1, edge: 'NE' }],
    owner: undefined
  },
  {
    id: 3,
    position: { x: 450, y: 350 },
    market: MarketPair.BrickWheat,
    type: 'double',
    hexEdges: [{ hexIndex: 2, edge: 'E' }, { hexIndex: 3, edge: 'W' }],
    owner: undefined
  },
  {
    id: 4,
    position: { x: 400, y: 450 },
    market: MarketPair.SheepOre,
    type: 'single',
    hexEdges: [{ hexIndex: 4, edge: 'SE' }],
    owner: undefined
  },
  {
    id: 5,
    position: { x: 300, y: 500 },
    market: MarketPair.OreWheat,
    type: 'single',
    hexEdges: [{ hexIndex: 5, edge: 'SW' }],
    owner: undefined
  },
  {
    id: 6,
    position: { x: 200, y: 450 },
    market: MarketPair.WoodOre,
    type: 'single',
    hexEdges: [{ hexIndex: 6, edge: 'W' }],
    owner: undefined
  },
  {
    id: 7,
    position: { x: 150, y: 350 },
    market: MarketPair.WoodWheat,
    type: 'single',
    hexEdges: [{ hexIndex: 7, edge: 'NW' }],
    owner: undefined
  },
  {
    id: 8,
    position: { x: 200, y: 250 },
    market: MarketPair.BrickSheep,
    type: 'single',
    hexEdges: [{ hexIndex: 8, edge: 'N' }],
    owner: undefined
  },
  {
    id: 9,
    position: { x: 300, y: 350 },
    market: MarketPair.SheepWheat,
    type: 'double',
    hexEdges: [{ hexIndex: 9, edge: 'NE' }, { hexIndex: 10, edge: 'SW' }],
    owner: undefined
  }
]

// Helper function to get port by vertex ID (mock implementation)
export function getPortByVertex(vertexId: string): Port | null {
  // In a real implementation, this would match vertex IDs to port positions
  // For now, return the first port as a mock
  // TODO: Implement proper vertex ID matching once integrated with board
  void vertexId // Acknowledge the parameter
  return mockPorts[0] || null
}

// Helper to get AMM pool for a port
export function getAMMPoolForPort(port: Port): AMMPool {
  return mockAMMPools[port.market]
}