import React from 'react'
import { GlobalVertex, Building as BuildingModel, BuildingType } from '@/models/board.models'

interface BuildingProps {
  vertex: GlobalVertex
  building: BuildingModel
}

export default function Building({ vertex, building }: BuildingProps) {
  const { x, y } = vertex.position
  const playerColor = `var(--player-${building.player})`
  
  if (building.type === BuildingType.Settlement) {
    return (
      <g className="settlement">
        {/* Shadow */}
        <path
          d={`
            M ${x} ${y - 12}
            L ${x + 10} ${y - 4}
            L ${x + 10} ${y + 8}
            L ${x - 10} ${y + 8}
            L ${x - 10} ${y - 4}
            Z
          `}
          fill="var(--shadow-medium)"
          transform="translate(2, 2)"
        />
        
        {/* Main building */}
        <path
          d={`
            M ${x} ${y - 12}
            L ${x + 10} ${y - 4}
            L ${x + 10} ${y + 8}
            L ${x - 10} ${y + 8}
            L ${x - 10} ${y - 4}
            Z
          `}
          fill={playerColor}
          stroke="var(--background)"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        
        {/* Roof highlight */}
        <path
          d={`
            M ${x - 8} ${y - 3}
            L ${x} ${y - 10}
            L ${x + 8} ${y - 3}
          `}
          stroke={playerColor}
          strokeWidth={1}
          fill="none"
          opacity={0.5}
          style={{ filter: 'brightness(1.5)' }}
        />
      </g>
    )
  } else {
    // City
    return (
      <g className="city">
        {/* Shadow */}
        <path
          d={`
            M ${x - 12} ${y + 10}
            L ${x - 12} ${y - 2}
            L ${x - 8} ${y - 6}
            L ${x - 8} ${y - 10}
            L ${x - 4} ${y - 10}
            L ${x - 4} ${y - 6}
            L ${x} ${y - 10}
            L ${x} ${y - 6}
            L ${x + 4} ${y - 10}
            L ${x + 4} ${y - 6}
            L ${x + 8} ${y - 10}
            L ${x + 8} ${y - 6}
            L ${x + 12} ${y - 2}
            L ${x + 12} ${y + 10}
            Z
          `}
          fill="var(--shadow-medium)"
          transform="translate(2, 2)"
        />
        
        {/* Main building */}
        <path
          d={`
            M ${x - 12} ${y + 10}
            L ${x - 12} ${y - 2}
            L ${x - 8} ${y - 6}
            L ${x - 8} ${y - 10}
            L ${x - 4} ${y - 10}
            L ${x - 4} ${y - 6}
            L ${x} ${y - 10}
            L ${x} ${y - 6}
            L ${x + 4} ${y - 10}
            L ${x + 4} ${y - 6}
            L ${x + 8} ${y - 10}
            L ${x + 8} ${y - 6}
            L ${x + 12} ${y - 2}
            L ${x + 12} ${y + 10}
            Z
          `}
          fill={playerColor}
          stroke="var(--background)"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        
        {/* Tower highlights */}
        <line
          x1={x - 6}
          y1={y - 8}
          x2={x - 6}
          y2={y - 4}
          stroke={playerColor}
          strokeWidth={1}
          opacity={0.5}
          style={{ filter: 'brightness(1.5)' }}
        />
        <line
          x1={x + 6}
          y1={y - 8}
          x2={x + 6}
          y2={y - 4}
          stroke={playerColor}
          strokeWidth={1}
          opacity={0.5}
          style={{ filter: 'brightness(1.5)' }}
        />
      </g>
    )
  }
}