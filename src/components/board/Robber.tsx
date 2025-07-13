import React from 'react'

interface RobberProps {
  x: number
  y: number
}

export default function Robber({ x, y }: RobberProps) {
  const height = 40
  const baseWidth = 25
  const topWidth = 15
  const headRadius = 12

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
        strokeWidth={1.5}
      />
      
      {/* Body highlight */}
      <path
        d={`
          M ${x - topWidth/3} ${y - height/3}
          L ${x - topWidth/4} ${y - height/2.5}
          L ${x - baseWidth/3} ${y + height/3}
        `}
        stroke="var(--background)"
        strokeWidth={1.5}
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
        strokeWidth={1.5}
      />
      
      {/* Head highlight */}
      <circle
        cx={x - 3}
        cy={y - height/2 - headRadius/2 - 3}
        r={3}
        fill="var(--background)"
        opacity={0.3}
      />
    </g>
  )
}