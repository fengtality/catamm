import { AMMPool, Resource } from '@/types/game.types'

interface MarketsListProps {
  ammPools: AMMPool[]
  currentPlayer?: number
  onSelectMarket: (pool: AMMPool) => void
}

const resourceInfo = {
  [Resource.Wood]: { emoji: '🪵', name: 'Wood', color: 'var(--resource-wood)' },
  [Resource.Brick]: { emoji: '🧱', name: 'Brick', color: 'var(--resource-brick)' },
  [Resource.Sheep]: { emoji: '🐑', name: 'Sheep', color: 'var(--resource-sheep)' },
  [Resource.Wheat]: { emoji: '🌾', name: 'Wheat', color: 'var(--resource-wheat)' },
  [Resource.Ore]: { emoji: '⛰️', name: 'Ore', color: 'var(--resource-ore)' },
}

export default function MarketsList({ ammPools, onSelectMarket }: MarketsListProps) {
  // Filter to only show active pools
  const activePools = ammPools.filter(pool => pool.isActive)
  
  return (
    <div className="p-4">
      <h3 className="text-lg font-mono font-semibold mb-4">Markets</h3>
      
      <div className="space-y-2">
        {activePools.map((pool) => {
          const resourceA = resourceInfo[pool.resourceA]
          const resourceB = resourceInfo[pool.resourceB]
          
          return (
            <button
              key={pool.market}
              onClick={() => onSelectMarket(pool)}
              className="w-full p-3 border border-border hover:bg-accent hover:border-accent-foreground transition-colors text-left"
            >
              <div className="flex justify-between">
                {/* Left side - Title and Owner */}
                <div className="space-y-1">
                  {/* Market name - larger */}
                  <div className="font-mono text-base font-medium flex items-center space-x-1">
                    <span style={{ color: resourceA.color }}>{resourceA.emoji}</span>
                    <span>{resourceA.name}</span>
                    <span className="text-muted-foreground">-</span>
                    <span style={{ color: resourceB.color }}>{resourceB.emoji}</span>
                    <span>{resourceB.name}</span>
                  </div>
                  {/* Owner */}
                  {pool.owner !== undefined && (
                    <div 
                      className="text-xs font-mono"
                      style={{ color: `var(--player-${pool.owner})` }}
                    >
                      Player {pool.owner}
                    </div>
                  )}
                </div>
                
                {/* Right side - Price and Reserves */}
                <div className="text-right space-y-1">
                  {/* Price */}
                  <div className="font-mono text-base font-semibold">
                    {(pool.reserveB / pool.reserveA).toFixed(2)}
                  </div>
                  {/* Reserves */}
                  <div className="text-xs font-mono text-muted-foreground">
                    {pool.reserveA}/{pool.reserveB}
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
      
      {activePools.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          No active markets
        </p>
      )}
    </div>
  )
}