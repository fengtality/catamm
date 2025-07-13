
import React from 'react'

export default function AMMMarkets() {
  // Placeholder for AMM markets display
  const markets = [
    { pair: 'Wood/Brick', status: 'Active', liquidity: '100/150' },
    { pair: 'Sheep/Wheat', status: 'Active', liquidity: '200/180' },
    { pair: 'Ore/Wood', status: 'Inactive', liquidity: '0/0' },
  ]

  return (
    <div className="p-4">
      <h3 className="text-lg font-mono font-semibold mb-3">AMM Markets</h3>
      <div className="space-y-3">
        {markets.map((market) => (
          <div
            key={market.pair}
            className="p-3 bg-sidebar-accent"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono font-medium text-sm">{market.pair}</span>
              <span
                className={`text-xs px-2 py-1 font-mono rounded ${
                  market.status === 'Active'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {market.status}
              </span>
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              Liquidity: {market.liquidity}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}