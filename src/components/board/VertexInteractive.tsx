import React from 'react'
import { GlobalVertex } from '@/models/board.models'

interface VertexInteractiveProps {
  vertex: GlobalVertex
  isPortable: boolean
  isSelected: boolean
  onClick: () => void
}

export default function VertexInteractive({
  vertex,
  isPortable,
  isSelected,
  onClick
}: VertexInteractiveProps) {
  const { x, y } = vertex.position
  const radius = isSelected && isPortable ? 15 : 8
  
  const fillColor = isSelected 
    ? isPortable 
      ? 'var(--selection-primary)' 
      : 'var(--selection-secondary)'
    : isPortable
      ? 'var(--selection-primary)'
      : 'var(--background)'
  
  const strokeColor = isSelected && isPortable
    ? 'var(--selection-primary)'
    : 'var(--foreground)'

  return (
    <g className="vertex-interactive" onClick={onClick}>
      {/* Glow effect for selected portable */}
      {isSelected && isPortable && (
        <circle
          cx={x}
          cy={y}
          r={radius + 5}
          fill={fillColor}
          opacity={0.3}
          className="animate-pulse"
        />
      )}
      
      {/* Main vertex circle */}
      <circle
        cx={x}
        cy={y}
        r={radius}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={isSelected && isPortable ? 3 : 1}
        className={isSelected ? 'animate-pulse' : ''}
        style={{
          filter: isSelected && isPortable ? 'drop-shadow(0 0 8px var(--selection-primary))' : undefined,
          transition: 'all 0.2s ease'
        }}
      />
      
      {/* Label for selected portable */}
      {isSelected && isPortable && (
        <text
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-background text-sm font-bold font-mono select-none"
          style={{ pointerEvents: 'none' }}
        >
          P
        </text>
      )}
      
      {/* Invisible click area */}
      <circle
        cx={x}
        cy={y}
        r={12}
        fill="transparent"
        className="cursor-pointer hover:fill-white hover:fill-opacity-10"
      />
    </g>
  )
}