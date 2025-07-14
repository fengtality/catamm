export enum DevCardType {
  Knight = 'knight',
  VictoryPoint = 'victory_point',
  RoadBuilding = 'road_building',
  YearOfPlenty = 'year_of_plenty',
  Monopoly = 'monopoly'
}

export interface DevCard {
  id: string
  type: DevCardType
  playedTurn?: number  // Turn when the card was played (for knights)
  purchasedTurn: number // Turn when the card was purchased
}

// Simple probability-based system
export const DEV_CARD_PROBABILITIES = {
  [DevCardType.Knight]: 0.56,        // 14/25 = 56%
  [DevCardType.VictoryPoint]: 0.20,  // 5/25 = 20%
  [DevCardType.RoadBuilding]: 0.08,  // 2/25 = 8%
  [DevCardType.YearOfPlenty]: 0.08,  // 2/25 = 8%
  [DevCardType.Monopoly]: 0.08       // 2/25 = 8%
}

// Generate a random dev card based on probabilities
export function drawRandomDevCard(): DevCardType {
  const rand = Math.random()
  let cumulative = 0
  
  for (const [type, probability] of Object.entries(DEV_CARD_PROBABILITIES)) {
    cumulative += probability
    if (rand < cumulative) {
      return type as DevCardType
    }
  }
  
  return DevCardType.Knight // Fallback
}

export const DEV_CARD_COST = {
  [Resource.Ore]: 1,
  [Resource.Wheat]: 1,
  [Resource.Sheep]: 1
}

// Helper to check if a card can be played
export function canPlayDevCard(card: DevCard, currentTurn: number): boolean {
  // Victory points are never "played", they're just revealed at game end
  if (card.type === DevCardType.VictoryPoint) {
    return false
  }
  
  // Other cards can only be played if purchased in a previous turn
  return card.purchasedTurn < currentTurn
}

// Import Resource type
import { Resource } from '@/types'