
import React from 'react'
import { Resource } from '@/types'

interface PlayerInfoProps {
  currentPlayer: number
  resources: Record<Resource, number>
}

const RESOURCE_NAMES: Record<Resource, string> = {
  [Resource.Wood]: 'Wood',
  [Resource.Brick]: 'Brick',
  [Resource.Sheep]: 'Sheep',
  [Resource.Wheat]: 'Wheat',
  [Resource.Ore]: 'Ore'
}

const RESOURCE_COLORS: Record<Resource, string> = {
  [Resource.Wood]: 'bg-accent text-accent-foreground',
  [Resource.Brick]: 'bg-accent text-accent-foreground',
  [Resource.Sheep]: 'bg-accent text-accent-foreground',
  [Resource.Wheat]: 'bg-accent text-accent-foreground',
  [Resource.Ore]: 'bg-accent text-accent-foreground'
}

export default function PlayerInfo({ currentPlayer, resources }: PlayerInfoProps) {
  return (
    <div className="p-4">
      <h3 className="text-lg font-mono font-semibold mb-3">
        Player {currentPlayer} Resources
      </h3>
      <div className="space-y-2">
        {Object.entries(resources).map(([resource, count]) => (
          <div
            key={resource}
            className="flex items-center justify-between"
          >
            <span
              className={`px-3 py-1 text-sm font-mono font-medium ${
                RESOURCE_COLORS[resource as Resource]
              }`}
            >
              {RESOURCE_NAMES[resource as Resource]}
            </span>
            <span className="text-xl font-mono font-bold">{count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}