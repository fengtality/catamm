import React from 'react'
import { Resource } from '@/types'

interface HexShapeProps {
  points: string
  resource: Resource | null
  isSelected: boolean
}

export default function HexShape({
  points,
  resource,
  isSelected
}: HexShapeProps) {
  // Map resources to CSS variable names
  const getResourceColor = (resource: Resource | null): string => {
    if (!resource) return 'var(--resource-desert)'
    
    const colorMap: Record<Resource, string> = {
      [Resource.Wood]: 'var(--resource-wood)',
      [Resource.Brick]: 'var(--resource-brick)',
      [Resource.Sheep]: 'var(--resource-sheep)',
      [Resource.Wheat]: 'var(--resource-wheat)',
      [Resource.Ore]: 'var(--resource-ore)'
    }
    
    return colorMap[resource]
  }

  return (
    <polygon
      points={points}
      fill={getResourceColor(resource)}
      className={isSelected ? 'brightness-110' : ''}
      style={{
        filter: isSelected ? 'brightness(1.2)' : undefined,
        transition: 'filter 0.2s ease'
      }}
    />
  )
}