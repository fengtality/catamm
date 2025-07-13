
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
  [Resource.Wood]: 'bg-green-100 text-green-800',
  [Resource.Brick]: 'bg-red-100 text-red-800',
  [Resource.Sheep]: 'bg-lime-100 text-lime-800',
  [Resource.Wheat]: 'bg-yellow-100 text-yellow-800',
  [Resource.Ore]: 'bg-gray-100 text-gray-800'
}

export default function PlayerInfo({ currentPlayer, resources }: PlayerInfoProps) {
  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-3">
        Player {currentPlayer} Resources
      </h3>
      <div className="space-y-2">
        {Object.entries(resources).map(([resource, count]) => (
          <div
            key={resource}
            className="flex items-center justify-between"
          >
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                RESOURCE_COLORS[resource as Resource]
              }`}
            >
              {RESOURCE_NAMES[resource as Resource]}
            </span>
            <span className="text-xl font-bold">{count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}