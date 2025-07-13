import React from 'react'
import { 
  GlobalVertex, 
  Building as BuildingModel, 
  BuildingType,
  BUILDING_SETTLEMENT_SIZE,
  BUILDING_CITY_SIZE
} from '@/models/board.models'

interface BuildingProps {
  vertex: GlobalVertex
  building: BuildingModel
  isSelected: boolean
  onClick: () => void
}

export default function Building({ vertex, building, isSelected, onClick }: BuildingProps) {
  const { x, y } = vertex.position
  const playerColor = `var(--player-${building.player})`
  
  if (building.type === BuildingType.Settlement) {
    const size = BUILDING_SETTLEMENT_SIZE
    const halfSize = size / 2
    const roofHeight = size * 0.5
    const wallHeight = size * 0.67
    
    return (
      <g className="settlement" onClick={onClick} style={{ cursor: 'pointer' }}>
        {/* Shadow */}
        <path
          d={`
            M ${x} ${y - roofHeight}
            L ${x + halfSize} ${y - roofHeight/3}
            L ${x + halfSize} ${y + wallHeight/2}
            L ${x - halfSize} ${y + wallHeight/2}
            L ${x - halfSize} ${y - roofHeight/3}
            Z
          `}
          fill="var(--shadow-medium)"
          transform="translate(4, 4)"
        />
        
        {/* Main building */}
        <path
          d={`
            M ${x} ${y - roofHeight}
            L ${x + halfSize} ${y - roofHeight/3}
            L ${x + halfSize} ${y + wallHeight/2}
            L ${x - halfSize} ${y + wallHeight/2}
            L ${x - halfSize} ${y - roofHeight/3}
            Z
          `}
          fill={playerColor}
          stroke={isSelected ? 'var(--selection-primary)' : 'var(--background)'}
          strokeWidth={isSelected ? 4 : 2}
          strokeLinejoin="round"
          className={isSelected ? 'animate-pulse' : ''}
          style={{
            filter: isSelected ? 'drop-shadow(0 0 8px var(--selection-primary))' : undefined
          }}
        />
        
        {/* Roof highlight */}
        <path
          d={`
            M ${x - halfSize * 0.8} ${y - roofHeight/4}
            L ${x} ${y - roofHeight * 0.8}
            L ${x + halfSize * 0.8} ${y - roofHeight/4}
          `}
          stroke={playerColor}
          strokeWidth={2}
          fill="none"
          opacity={0.5}
          style={{ filter: 'brightness(1.5)' }}
        />
      </g>
    )
  } else {
    // City - Simple castle icon
    const size = BUILDING_CITY_SIZE
    const halfSize = size / 2
    
    return (
      <g className="city" onClick={onClick} style={{ cursor: 'pointer' }}>
        {/* Shadow */}
        <rect
          x={x - halfSize}
          y={y - halfSize + 4}
          width={size}
          height={size}
          fill="var(--shadow-medium)"
          transform="translate(4, 4)"
        />
        
        {/* Main castle body */}
        <rect
          x={x - halfSize}
          y={y - halfSize + 4}
          width={size}
          height={size}
          fill={playerColor}
          stroke={isSelected ? 'var(--selection-primary)' : 'var(--background)'}
          strokeWidth={isSelected ? 5 : 3}
          className={isSelected ? 'animate-pulse' : ''}
          style={{
            filter: isSelected ? 'drop-shadow(0 0 8px var(--selection-primary))' : undefined
          }}
        />
        
        {/* Castle towers */}
        <rect
          x={x - halfSize}
          y={y - halfSize - 4}
          width={size * 0.3}
          height={size * 0.3}
          fill={playerColor}
          stroke={isSelected ? 'var(--selection-primary)' : 'var(--background)'}
          strokeWidth={isSelected ? 3 : 2}
        />
        <rect
          x={x - size * 0.15}
          y={y - halfSize - 4}
          width={size * 0.3}
          height={size * 0.3}
          fill={playerColor}
          stroke={isSelected ? 'var(--selection-primary)' : 'var(--background)'}
          strokeWidth={isSelected ? 3 : 2}
        />
        <rect
          x={x + halfSize - size * 0.3}
          y={y - halfSize - 4}
          width={size * 0.3}
          height={size * 0.3}
          fill={playerColor}
          stroke={isSelected ? 'var(--selection-primary)' : 'var(--background)'}
          strokeWidth={isSelected ? 3 : 2}
        />
      </g>
    )
  }
}