
import { Resource } from '@/types'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

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
  playerResources?: Record<number, Record<string, number>>
}

const resourceEmojis: Record<Resource, string> = {
  [Resource.Wood]: '🪵',
  [Resource.Brick]: '🧱',
  [Resource.Sheep]: '🐑',
  [Resource.Wheat]: '🌾',
  [Resource.Ore]: '⛰️'
}

export default function Leaderboard({ players, currentPlayer, playerResources }: LeaderboardProps) {
  // Show players in turn order (by playerId)
  const sortedPlayers = [...players].sort((a, b) => a.playerId - b.playerId)
  const maxVP = 10 // Victory condition
  
  return (
    <TooltipProvider delayDuration={100}>
      <div className="p-4">
        <h3 className="text-lg font-mono font-semibold mb-3">Players</h3>
        <div className="space-y-3">
        {sortedPlayers.map((player) => {
          const percentage = (player.totalVP / maxVP) * 100
          
          const isCurrentPlayer = player.playerId === currentPlayer
          const playerColor = `var(--player-${player.playerId})`
          
          return (
            <Tooltip key={player.playerId}>
              <TooltipTrigger asChild>
                <div 
                  className="space-y-1 p-2 -mx-2 rounded-sm cursor-help"
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
                  
                  {/* Resources */}
                  <div className="flex items-center justify-start space-x-2 text-xs font-mono">
                    {playerResources && playerResources[player.playerId] && (
                      <>
                        {Object.entries(resourceEmojis).map(([resource, emoji]) => {
                          const amount = playerResources[player.playerId]?.[resource] || 0
                          return (
                            <span key={resource} className="flex items-center">
                              <span>{emoji}</span>
                              <span className="ml-0.5">{Math.trunc(amount)}</span>
                            </span>
                          )
                        })}
                      </>
                    )}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-xs font-mono space-y-2">
                  {/* Player Name Header */}
                  <div className="text-sm font-semibold" style={{ color: playerColor }}>
                    Player {player.playerId}
                  </div>
                  
                  {/* Victory Points Section */}
                  <div className="space-y-1">
                    <div className="font-semibold text-foreground">Victory Points</div>
                    {player.settlements > 0 && (
                      <div>Settlements: {player.settlements} × 1 = {player.settlements}VP</div>
                    )}
                    {player.cities > 0 && (
                      <div>Cities: {player.cities} × 2 = {player.cities * 2}VP</div>
                    )}
                    {player.largestArmy > 0 && (
                      <div>Largest Army: {player.largestArmy}VP</div>
                    )}
                    {player.longestRoad > 0 && (
                      <div>Longest Road: {player.longestRoad}VP</div>
                    )}
                    {player.devCardVP && player.devCardVP > 0 && (
                      <div>Dev Cards: {player.devCardVP}VP</div>
                    )}
                    {player.totalVP === 0 ? (
                      <div className="text-muted-foreground">No victory points yet</div>
                    ) : (
                      <div className="border-t pt-1 font-semibold">Total: {player.totalVP}VP</div>
                    )}
                  </div>
                  
                  {/* Resources Section */}
                  {playerResources && playerResources[player.playerId] && (
                    <div className="space-y-1 border-t pt-2">
                      <div className="font-semibold text-foreground">Resources (Actual)</div>
                      {Object.entries(resourceEmojis).map(([resource, emoji]) => {
                        const amount = playerResources[player.playerId]?.[resource] || 0
                        return (
                          <div key={resource} className="flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <span>{emoji}</span>
                              <span className="text-muted-foreground capitalize">{resource}</span>
                            </span>
                            <span>{amount.toFixed(3)}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          )
        })}
        </div>
      </div>
    </TooltipProvider>
  )
}