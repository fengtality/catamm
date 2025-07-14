import { Resource, MarketPair, AMMPool } from '@/types/game.types'
import { Board, GlobalVertex } from '@/models/board.models'

// Helper to create a market pair from two resources
export function getMarketPairFromResources(
  resourceA: Resource,
  resourceB: Resource
): MarketPair | null {
  // Create all possible combinations
  const marketMap: Record<string, MarketPair> = {
    [`${Resource.Wood}-${Resource.Brick}`]: MarketPair.WoodBrick,
    [`${Resource.Brick}-${Resource.Wood}`]: MarketPair.WoodBrick,
    [`${Resource.Wood}-${Resource.Sheep}`]: MarketPair.WoodSheep,
    [`${Resource.Sheep}-${Resource.Wood}`]: MarketPair.WoodSheep,
    [`${Resource.Wood}-${Resource.Ore}`]: MarketPair.WoodOre,
    [`${Resource.Ore}-${Resource.Wood}`]: MarketPair.WoodOre,
    [`${Resource.Wood}-${Resource.Wheat}`]: MarketPair.WoodWheat,
    [`${Resource.Wheat}-${Resource.Wood}`]: MarketPair.WoodWheat,
    [`${Resource.Brick}-${Resource.Sheep}`]: MarketPair.BrickSheep,
    [`${Resource.Sheep}-${Resource.Brick}`]: MarketPair.BrickSheep,
    [`${Resource.Brick}-${Resource.Ore}`]: MarketPair.BrickOre,
    [`${Resource.Ore}-${Resource.Brick}`]: MarketPair.BrickOre,
    [`${Resource.Brick}-${Resource.Wheat}`]: MarketPair.BrickWheat,
    [`${Resource.Wheat}-${Resource.Brick}`]: MarketPair.BrickWheat,
    [`${Resource.Sheep}-${Resource.Ore}`]: MarketPair.SheepOre,
    [`${Resource.Ore}-${Resource.Sheep}`]: MarketPair.SheepOre,
    [`${Resource.Sheep}-${Resource.Wheat}`]: MarketPair.SheepWheat,
    [`${Resource.Wheat}-${Resource.Sheep}`]: MarketPair.SheepWheat,
    [`${Resource.Ore}-${Resource.Wheat}`]: MarketPair.OreWheat,
    [`${Resource.Wheat}-${Resource.Ore}`]: MarketPair.OreWheat,
  }
  
  const key = `${resourceA}-${resourceB}`
  return marketMap[key] || null
}

// Get the market that would be created by building on a portable vertex
export function getMarketForPortableVertex(
  vertex: GlobalVertex,
  board: Board
): { market: MarketPair | null; resources: [Resource, Resource] | null } {
  // A portable vertex on the perimeter has exactly 2 adjacent hexes
  if (vertex.hexes.length !== 2) {
    return { market: null, resources: null }
  }
  
  const hex1 = board.hexes[vertex.hexes[0].hexIndex]
  const hex2 = board.hexes[vertex.hexes[1].hexIndex]
  
  // Check if both hexes have resources (not desert)
  if (!hex1.resource || !hex2.resource) {
    // One or both hexes are desert
    return { market: null, resources: null }
  }
  
  // If both hexes have the same resource, no market is created
  if (hex1.resource === hex2.resource) {
    // Both hexes have same resource
    return { market: null, resources: null }
  }
  
  const market = getMarketPairFromResources(hex1.resource, hex2.resource)
  
  return { 
    market, 
    resources: [hex1.resource, hex2.resource] as [Resource, Resource]
  }
}

// Create a new market at a vertex
export function createMarket(
  vertexId: string,
  resourceA: Resource,
  resourceB: Resource,
  owner: number
): AMMPool {
  const market = getMarketPairFromResources(resourceA, resourceB)
  if (!market) {
    throw new Error('Invalid resource pair for market')
  }
  
  const initialReserve = 1 // Starting liquidity
  return {
    id: `market-${vertexId}`,
    market,
    resourceA,
    resourceB,
    reserveA: initialReserve,
    reserveB: initialReserve,
    isActive: true,
    k: initialReserve * initialReserve,
    owner,
    vertexId
  }
}