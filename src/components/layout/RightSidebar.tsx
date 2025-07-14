
import { useState } from 'react'
import Leaderboard from '../player/Leaderboard'
import SelectionInfo from '../game/SelectionInfo'
import MarketsList from '../amm/MarketsList'
import AMMWidget from '../amm/AMMWidget'
import { GameState } from '../shared/types'
import { Board, BuildingType } from '@/models/board.models'
import { Resource, AMMPool } from '@/types/game.types'
import { DevCardType, DevCard } from '@/types/development-cards'

interface RightSidebarProps {
  gameState: GameState
  currentPlayer: number
  playerResources: Record<number, Record<string, number>>
  board: Board | null
  selectedVertex?: string | null
  selectedResource?: Resource | null
  onResourceSelect?: (resource: Resource | null) => void
  activeMarkets?: Map<string, AMMPool>
  onVertexDeselect?: () => void
  onVertexSelect?: (vertexId: string | null) => void
  numPlayers?: number
  onQuickAction?: (action: string) => void
  currentTurn?: number
  playerDevCards?: number
  playerDevCardsArray?: DevCard[]
  setupRound?: number
  setupBuildings?: number
  hasResourcesFor?: (purchaseType: 'Settlement' | 'City' | 'Road' | 'DevCard') => boolean
  selectedHex?: number | null
  selectedEdge?: string | null
  showSelectionInfo?: boolean
}

export default function RightSidebar({
  gameState,
  currentPlayer,
  playerResources,
  board,
  selectedVertex,
  onResourceSelect,
  activeMarkets,
  onVertexDeselect,
  onVertexSelect,
  numPlayers = 8,
  onQuickAction,
  currentTurn,
  playerDevCards,
  playerDevCardsArray,
  setupRound,
  setupBuildings,
  hasResourcesFor,
  selectedHex,
  selectedEdge,
  showSelectionInfo = false
}: RightSidebarProps) {
  const [selectedMarket, setSelectedMarket] = useState<AMMPool | null>(null)
  
  // Calculate actual VP from board state
  const calculatePlayerStats = () => {
    const stats = Array.from({ length: numPlayers }, (_, i) => i + 1).map(playerId => ({
      playerId,
      settlements: 0,
      cities: 0,
      largestArmy: 0,
      longestRoad: 0,
      devCardVP: 0,
      totalVP: 0
    }))
    
    if (board) {
      // Count buildings
      board.buildings.forEach((building) => {
        const playerStats = stats[building.player - 1]
        if (playerStats) {
          if (building.type === BuildingType.Settlement) {
            playerStats.settlements++
            playerStats.totalVP += 1
          } else if (building.type === BuildingType.City) {
            playerStats.cities++
            playerStats.totalVP += 2
          }
        }
      })
      
      // Count dev card VPs
      Object.entries(gameState.playerDevCards || {}).forEach(([playerId, cards]) => {
        const player = parseInt(playerId)
        const playerStats = stats[player - 1]
        if (playerStats && cards) {
          const vpCards = cards.filter(card => card.type === DevCardType.VictoryPoint).length
          playerStats.devCardVP = vpCards
          playerStats.totalVP += vpCards
        }
      })
      
      // Check for largest army (3+ knights)
      let largestArmyPlayer = 0
      let largestArmyCount = 2 // Need at least 3 knights
      Object.entries(gameState.knightsPlayed || {}).forEach(([playerId, knights]) => {
        if (knights > largestArmyCount) {
          largestArmyCount = knights
          largestArmyPlayer = parseInt(playerId)
        }
      })
      
      if (largestArmyPlayer > 0) {
        const playerStats = stats[largestArmyPlayer - 1]
        if (playerStats) {
          playerStats.largestArmy = 2
          playerStats.totalVP += 2
        }
      }
      
      // TODO: Add longest road calculation
      stats.forEach(stat => {
        stat.totalVP += stat.longestRoad
      })
    }
    
    return stats
  }
  
  const players = calculatePlayerStats()
  
  // Calculate total resources across all players - commented out as unused
  // const calculateTotalResources = (): Record<Resource, number> => {
  //   const totals: Record<string, number> = {
  //     [Resource.Wood]: 0,
  //     [Resource.Brick]: 0,
  //     [Resource.Sheep]: 0,
  //     [Resource.Wheat]: 0,
  //     [Resource.Ore]: 0
  //   }
  //   
  //   Object.values(playerResources).forEach(resources => {
  //     Object.entries(resources).forEach(([resource, amount]) => {
  //       if (resource in totals) {
  //         totals[resource] += amount
  //       }
  //     })
  //   })
  //   
  //   return totals as Record<Resource, number>
  // }
  
  // const totalResources = calculateTotalResources() // Unused variable
  const currentPlayerResources = playerResources[currentPlayer] || {}
  
  // Determine market based on selected vertex
  let selectedAMMPool: AMMPool | null = null
  
  if (selectedVertex && activeMarkets) {
    // Check if there's a market at this vertex
    const market = activeMarkets.get(selectedVertex)
    if (market) {
      selectedAMMPool = market
    }
  }
  
  // Show AMM widget when a market is selected (from vertex or manually)
  const showAMMWidget = selectedAMMPool || selectedMarket
  const activeMarket = selectedMarket || selectedAMMPool
  
    
  const handleSwap = (resourceIn: Resource, amountIn: number, resourceOut: Resource, amountOut: number) => {
    // TODO: Implement actual swap logic
    // For now, just log the parameters to avoid unused variable warnings
    void { resourceIn, amountIn, resourceOut, amountOut }
  }
  
  const handleDeposit = (amountA: number, amountB: number) => {
    // TODO: Implement actual deposit logic
    // For now, just log the parameters to avoid unused variable warnings
    void { amountA, amountB }
  }
  
  const handleWithdraw = (liquidityAmount: number) => {
    // TODO: Implement actual withdraw logic
    // For now, just log the parameters to avoid unused variable warnings
    void { liquidityAmount }
  }
  
  return (
    <aside className="w-96 min-w-80 bg-sidebar border-l border-sidebar-border flex flex-col h-full">
      {/* Leaderboard */}
      <div className="border-b border-sidebar-border flex-1 overflow-auto">
        <Leaderboard 
          players={players} 
          currentPlayer={gameState.currentPlayer}
          playerResources={playerResources}
        />
      </div>

      {/* Selection Info */}
      {showSelectionInfo && (
        <div className="border-b border-sidebar-border">
          <SelectionInfo
            board={board}
            selectedHex={selectedHex || null}
            selectedVertex={selectedVertex || null}
            selectedEdge={selectedEdge || null}
          />
        </div>
      )}

      {/* Markets section */}
      <div className="border-t border-sidebar-border">
        {showAMMWidget && activeMarket ? (
          <AMMWidget
            ammPool={activeMarket}
            playerResources={currentPlayerResources as Record<Resource, number>}
            isOwner={activeMarket.owner === currentPlayer}
            onSwap={handleSwap}
            onDeposit={handleDeposit}
            onWithdraw={handleWithdraw}
            onClose={() => {
              setSelectedMarket(null)
              onResourceSelect?.(null)
              // Clear vertex selection when closing market
              if (activeMarket.vertexId === selectedVertex) {
                onVertexDeselect?.()
              }
            }}
          />
        ) : (
          <MarketsList
            ammPools={activeMarkets ? Array.from(activeMarkets.values()) : []}
            currentPlayer={currentPlayer}
            onSelectMarket={(market) => {
              setSelectedMarket(market)
              // Select the vertex when market is selected
              onVertexSelect?.(market.vertexId)
            }}
          />
        )}
      </div>
    </aside>
  )
}