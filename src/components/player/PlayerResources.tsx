import React from 'react'
import { Resource } from '@/types'

interface PlayerResourcesProps {
  resources: Record<string, number>
}

export default function PlayerResources({ resources }: PlayerResourcesProps) {
  const resourceDisplay = [
    { type: Resource.Wood, label: 'Wood', emoji: '🪵' },
    { type: Resource.Brick, label: 'Brick', emoji: '🧱' },
    { type: Resource.Sheep, label: 'Sheep', emoji: '🐑' },
    { type: Resource.Wheat, label: 'Wheat', emoji: '🌾' },
    { type: Resource.Ore, label: 'Ore', emoji: '⛰️' },
  ]
  
  return (
    <div className="p-4">
      <h3 className="text-lg font-mono font-semibold mb-3">Player Resources</h3>
      <div className="space-y-2">
        {resourceDisplay.map(({ type, label, emoji }) => (
          <div key={type} className="flex items-center justify-between text-sm font-mono">
            <div className="flex items-center space-x-2">
              <span>{emoji}</span>
              <span className="text-muted-foreground">{label}:</span>
            </div>
            <span className="font-semibold">{resources[type] || 0}</span>
          </div>
        ))}
      </div>
    </div>
  )
}