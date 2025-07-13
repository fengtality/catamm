import React from 'react'
import { ROBBER_SIZE } from '@/models/board.models'

interface RobberProps {
  x: number
  y: number
}

export default function Robber({ x, y }: RobberProps) {
  const height = ROBBER_SIZE
  const baseWidth = ROBBER_SIZE * 0.625  // 50 for size 80
  const topWidth = ROBBER_SIZE * 0.375   // 30 for size 80
  const headRadius = ROBBER_SIZE * 0.3   // 24 for size 80

  return (
    <g className="robber">
      {/* Shadow */}
      <ellipse
        cx={x}
        cy={y + height/2 + 5}
        rx={baseWidth/2 + 5}
        ry={8}
        fill="black"
        opacity={0.3}
      />
      
      {/* Body */}
      <path
        d={`
          M ${x - baseWidth/2} ${y + height/2}
          L ${x - topWidth/2} ${y - height/3}
          L ${x - topWidth/2} ${y - height/2}
          L ${x + topWidth/2} ${y - height/2}
          L ${x + topWidth/2} ${y - height/3}
          L ${x + baseWidth/2} ${y + height/2}
          Z
        `}
        fill="var(--foreground)"
        stroke="var(--background)"
        strokeWidth={3}
      />
      
      {/* Body highlight */}
      <path
        d={`
          M ${x - topWidth/3} ${y - height/3}
          L ${x - topWidth/4} ${y - height/2.5}
          L ${x - baseWidth/3} ${y + height/3}
        `}
        stroke="var(--background)"
        strokeWidth={3}
        fill="none"
        opacity={0.3}
      />
      
      {/* Head */}
      <circle
        cx={x}
        cy={y - height/2 - headRadius/2}
        r={headRadius}
        fill="var(--foreground)"
        stroke="var(--background)"
        strokeWidth={3}
      />
      
      {/* Head highlight */}
      <circle
        cx={x - 6}
        cy={y - height/2 - headRadius/2 - 6}
        r={6}
        fill="var(--background)"
        opacity={0.3}
      />
    </g>
  )
}