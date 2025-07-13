
import React from 'react'
import Leaderboard from '../player/Leaderboard'
import PlayerResources from '../player/PlayerResources'
import { GameState } from '../shared/types'
import { Board, BuildingType } from '@/models/board.models'

interface RightSidebarProps {
  gameState: GameState
  currentPlayer: number
  playerResources: Record<number, Record<string, number>>
  board: Board | null
}

export default function RightSidebar({
  gameState,
  currentPlayer,
  playerResources,
  board
}: RightSidebarProps) {
  // Calculate actual VP from board state
  const calculatePlayerStats = () => {
    const stats = [1, 2, 3, 4].map(playerId => ({
      playerId,
      settlements: 0,
      cities: 0,
      largestArmy: 0, // TODO: implement when we have development cards
      longestRoad: 0, // TODO: implement road length calculation
      totalVP: 0
    }))
    
    if (board) {
      // Count buildings
      board.buildings.forEach((building) => {
        const playerStats = stats[building.player - 1]
        if (building.type === BuildingType.Settlement) {
          playerStats.settlements++
          playerStats.totalVP += 1
        } else if (building.type === BuildingType.City) {
          playerStats.cities++
          playerStats.totalVP += 2
        }
      })
      
      // Add bonus VP (TODO: implement these properly)
      // For now, just add the largestArmy and longestRoad values
      stats.forEach(stat => {
        stat.totalVP += stat.largestArmy + stat.longestRoad
      })
    }
    
    return stats
  }
  
  const players = calculatePlayerStats()
  
  return (
    <aside className="w-80 bg-sidebar border-l border-sidebar-border flex flex-col h-full">
      {/* Leaderboard */}
      <div className="border-b border-sidebar-border flex-1 overflow-auto">
        <Leaderboard 
          players={players} 
          currentPlayer={gameState.currentPlayer}
          currentTurn={gameState.turn}
        />
      </div>

      {/* Player Resources */}
      <div className="border-t border-sidebar-border">
        <PlayerResources resources={playerResources[currentPlayer] || {}} />
      </div>
    </aside>
  )
}