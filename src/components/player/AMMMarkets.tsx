
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
      <h3 className="text-lg font-semibold mb-3">AMM Markets</h3>
      <div className="space-y-3">
        {markets.map((market) => (
          <div
            key={market.pair}
            className="p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-sm">{market.pair}</span>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  market.status === 'Active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {market.status}
              </span>
            </div>
            <div className="text-xs text-gray-600">
              Liquidity: {market.liquidity}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}