import { Resource } from '@/types/game.types'
import { AMMPool } from '@/types/game.types'

interface ResourcesOverviewProps {
  playerResources: Record<Resource, number>
  ammPools?: AMMPool[]
  currentPlayer: number
}

export default function ResourcesOverview({ 
  playerResources,
  ammPools = [],
  currentPlayer
}: ResourcesOverviewProps) {
  const resourceDisplay = [
    { type: Resource.Wood, label: 'Wood', emoji: '🪵', color: 'var(--resource-wood)' },
    { type: Resource.Brick, label: 'Brick', emoji: '🧱', color: 'var(--resource-brick)' },
    { type: Resource.Sheep, label: 'Sheep', emoji: '🐑', color: 'var(--resource-sheep)' },
    { type: Resource.Wheat, label: 'Wheat', emoji: '🌾', color: 'var(--resource-wheat)' },
    { type: Resource.Ore, label: 'Ore', emoji: '⛰️', color: 'var(--resource-ore)' },
  ]
  
  // Calculate resources in AMM pools
  const marketResources: Record<Resource, number> = {
    [Resource.Wood]: 0,
    [Resource.Brick]: 0,
    [Resource.Sheep]: 0,
    [Resource.Wheat]: 0,
    [Resource.Ore]: 0,
  }
  
  ammPools.forEach(pool => {
    if (pool.isActive) {
      marketResources[pool.resourceA] = (marketResources[pool.resourceA] || 0) + pool.reserveA
      marketResources[pool.resourceB] = (marketResources[pool.resourceB] || 0) + pool.reserveB
    }
  })
  
  const playerColor = `var(--player-${currentPlayer})`
  
  return (
    <div className="p-4">
      <h3 className="text-lg font-mono font-semibold mb-4">Resources</h3>
      
      <div className="space-y-2">
        {resourceDisplay.map(({ type, label, emoji, color }) => {
          const playerAmount = playerResources[type] || 0
          const marketAmount = marketResources[type] || 0
          
          return (
            <div key={type} className="flex items-center justify-between text-sm font-mono">
              <div className="flex items-center space-x-2">
                <span style={{ color }}>{emoji}</span>
                <span>{label}</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1">
                  <span style={{ color: playerColor }} className="font-semibold">{playerAmount}</span>
                  <span className="text-muted-foreground text-xs">you</span>
                </span>
                
                <span className="text-muted-foreground">·</span>
                
                <span className="flex items-center space-x-1">
                  <span className="font-semibold">{marketAmount}</span>
                  <span className="text-muted-foreground text-xs">market</span>
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}