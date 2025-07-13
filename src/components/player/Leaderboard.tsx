import React from 'react'

interface PlayerVP {
  playerId: number
  totalVP: number
  settlements: number
  cities: number
  largestArmy: number
  longestRoad: number
}

interface LeaderboardProps {
  players: PlayerVP[]
  currentPlayer: number
  currentTurn: number
}

export default function Leaderboard({ players, currentPlayer, currentTurn }: LeaderboardProps) {
  // Sort players by VP descending
  const sortedPlayers = [...players].sort((a, b) => b.totalVP - a.totalVP)
  const maxVP = 10 // Victory condition
  
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-mono font-semibold">Leaderboard</h3>
        <span className="text-sm font-mono text-muted-foreground">Turn {currentTurn}</span>
      </div>
      <div className="space-y-3">
        {sortedPlayers.map((player, index) => {
          const percentage = (player.totalVP / maxVP) * 100
          
          const isCurrentPlayer = player.playerId === currentPlayer
          
          return (
            <div key={player.playerId} className={`space-y-1 p-2 -mx-2 rounded ${isCurrentPlayer ? 'bg-accent' : ''}`}>
              {/* Player rank and VP */}
              <div className="flex items-center justify-between text-sm font-mono">
                <span className="font-medium flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    {index + 1}.
                    <span 
                      className="w-4 h-4 rounded border border-border"
                      style={{ backgroundColor: `var(--player-${player.playerId})` }}
                    />
                    Player {player.playerId}
                  </span>
                  {isCurrentPlayer && <span className="text-xs text-muted-foreground">(Current)</span>}
                </span>
                <span className="font-semibold">{player.totalVP}VP</span>
              </div>
              
              {/* Progress bar */}
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-300"
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: `var(--player-${player.playerId})`
                  }}
                />
              </div>
              
              {/* VP breakdown */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground">
                  {percentage.toFixed(0)}%
                </span>
                <span className="text-xs font-mono text-muted-foreground">
                  S:{player.settlements} C:{player.cities} LA:{player.largestArmy} LR:{player.longestRoad}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}