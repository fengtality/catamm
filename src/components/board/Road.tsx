import React from 'react'
import { GlobalEdge, GlobalVertex, ROAD_WIDTH } from '@/models/board.models'

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
        strokeWidth={ROAD_WIDTH}
        strokeLinecap="round"
        transform="translate(4, 4)"
        className="road-shadow"
      />
      
      {/* Main road */}
      <line
        x1={v1.position.x}
        y1={v1.position.y}
        x2={v2.position.x}
        y2={v2.position.y}
        stroke={playerColor}
        strokeWidth={ROAD_WIDTH}
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
        strokeWidth={ROAD_WIDTH * 0.25}
        strokeLinecap="round"
        opacity={0.5}
        style={{ filter: 'brightness(1.4)' }}
        className="road-highlight"
      />
    </g>
  )
}