import React from 'react'
import { GlobalEdge, GlobalVertex } from '@/models/board.models'

interface EdgeInteractiveProps {
  edge: GlobalEdge
  vertices: Map<string, GlobalVertex>
  isSelected: boolean
  onClick: () => void
}

export default function EdgeInteractive({
  edge,
  vertices,
  isSelected,
  onClick
}: EdgeInteractiveProps) {
  const v1 = vertices.get(edge.vertices[0])
  const v2 = vertices.get(edge.vertices[1])
  
  if (!v1 || !v2) return null
  
  const isPerimeter = edge.hexes.length === 1
  
  return (
    <g className="edge-interactive" onClick={onClick}>
      {/* Visible edge line */}
      <line
        x1={v1.position.x}
        y1={v1.position.y}
        x2={v2.position.x}
        y2={v2.position.y}
        stroke={
          isSelected 
            ? 'var(--selection-primary)' 
            : isPerimeter 
              ? 'var(--edge-perimeter)' 
              : 'var(--edge-default)'
        }
        strokeWidth={isSelected ? 4 : isPerimeter ? 1.5 : 1}
        strokeLinecap="round"
        className={isSelected ? 'animate-pulse' : ''}
        style={{
          filter: isSelected ? 'drop-shadow(0 0 8px var(--selection-primary))' : undefined
        }}
      />
      
      {/* Invisible click area */}
      <line
        x1={v1.position.x}
        y1={v1.position.y}
        x2={v2.position.x}
        y2={v2.position.y}
        stroke="transparent"
        strokeWidth={12}
        strokeLinecap="round"
        className="cursor-pointer hover:stroke-white hover:stroke-opacity-20"
        style={{ pointerEvents: 'stroke' }}
      />
    </g>
  )
}