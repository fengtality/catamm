import React from 'react'
import { GlobalEdge, GlobalVertex } from '@/models/board.models'

interface RoadProps {
  edge: GlobalEdge
  vertices: Map<string, GlobalVertex>
  player: number
}

export default function Road({ edge, vertices, player }: RoadProps) {
  const v1 = vertices.get(edge.vertices[0])
  const v2 = vertices.get(edge.vertices[1])
  
  if (!v1 || !v2) return null
  
  const playerColor = `var(--player-${player})`
  
  return (
    <g className="road">
      {/* Road shadow */}
      <line
        x1={v1.position.x}
        y1={v1.position.y}
        x2={v2.position.x}
        y2={v2.position.y}
        stroke="var(--shadow-medium)"
        strokeWidth={10}
        strokeLinecap="round"
        transform="translate(2, 2)"
        className="road-shadow"
      />
      
      {/* Main road */}
      <line
        x1={v1.position.x}
        y1={v1.position.y}
        x2={v2.position.x}
        y2={v2.position.y}
        stroke={playerColor}
        strokeWidth={6}
        strokeLinecap="round"
        className="road-main"
      />
      
      {/* Road highlight */}
      <line
        x1={v1.position.x + (v2.position.y - v1.position.y) * 0.02}
        y1={v1.position.y - (v2.position.x - v1.position.x) * 0.02}
        x2={v2.position.x + (v2.position.y - v1.position.y) * 0.02}
        y2={v2.position.y - (v2.position.x - v1.position.x) * 0.02}
        stroke={playerColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        opacity={0.5}
        style={{ filter: 'brightness(1.4)' }}
        className="road-highlight"
      />
    </g>
  )
}