
import React from 'react'
import Leaderboard from '../player/Leaderboard'
import PlayerResources from '../player/PlayerResources'
import { GameState } from '../shared/types'

interface RightSidebarProps {
  gameState: GameState
  currentPlayer: number
  playerResources: Record<number, Record<string, number>>
}

export default function RightSidebar({
  gameState,
  currentPlayer,
  playerResources
}: RightSidebarProps) {
  // Mock VP data - in real implementation, this would come from game state
  const mockPlayers = [
    { playerId: 1, totalVP: 7, settlements: 3, cities: 1, largestArmy: 2, longestRoad: 0 },
    { playerId: 2, totalVP: 5, settlements: 3, cities: 1, largestArmy: 0, longestRoad: 0 },
    { playerId: 3, totalVP: 4, settlements: 2, cities: 1, largestArmy: 0, longestRoad: 0 },
    { playerId: 4, totalVP: 2, settlements: 2, cities: 0, largestArmy: 0, longestRoad: 0 },
  ]
  
  return (
    <aside className="w-80 bg-sidebar border-l border-sidebar-border flex flex-col h-full">
      {/* Leaderboard */}
      <div className="border-b border-sidebar-border flex-1 overflow-auto">
        <Leaderboard 
          players={mockPlayers} 
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