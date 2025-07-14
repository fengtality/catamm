
interface PlayerVP {
  playerId: number
  totalVP: number
  settlements: number
  cities: number
  largestArmy: number
  longestRoad: number
  devCardVP?: number
}

interface LeaderboardProps {
  players: PlayerVP[]
  currentPlayer: number
}

export default function Leaderboard({ players, currentPlayer }: LeaderboardProps) {
  // Show players in turn order (by playerId)
  const sortedPlayers = [...players].sort((a, b) => a.playerId - b.playerId)
  const maxVP = 10 // Victory condition
  
  return (
    <div className="p-4">
      <h3 className="text-lg font-mono font-semibold mb-3">Players</h3>
      <div className="space-y-3">
        {sortedPlayers.map((player) => {
          const percentage = (player.totalVP / maxVP) * 100
          
          const isCurrentPlayer = player.playerId === currentPlayer
          const playerColor = `var(--player-${player.playerId})`
          
          return (
            <div 
              key={player.playerId} 
              className="space-y-1 p-2 -mx-2 rounded-sm"
              style={isCurrentPlayer ? { 
                borderColor: playerColor,
                borderWidth: '2px',
                borderStyle: 'solid'
              } : {}}
            >
              {/* Player and VP */}
              <div className="flex items-center justify-between text-sm font-mono">
                <span className="font-medium flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <span 
                      className="w-4 h-4 rounded border border-border"
                      style={{ backgroundColor: playerColor }}
                    />
                    <span style={{ color: playerColor }}>
                      Player {player.playerId}
                    </span>
                  </span>
                </span>
                <span className="font-semibold">{player.totalVP}VP</span>
              </div>
              
              {/* Progress bar */}
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-300"
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: playerColor
                  }}
                />
              </div>
              
              {/* VP breakdown */}
              <div className="flex items-center justify-end">
                <span className="text-xs font-mono text-muted-foreground">
                  S:{player.settlements} C:{player.cities}{player.devCardVP ? ` VP:${player.devCardVP}` : ''} LA:{player.largestArmy} LR:{player.longestRoad}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}