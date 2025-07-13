import React from 'react'
import { Hex } from '@/models/board.models'
import { Resource } from '@/types'
import HexShape from './HexShape'
import HexNumber from './HexNumber'
import Robber from './Robber'

interface HexTileProps {
  hex: Hex
  isSelected: boolean
  showNumber: boolean
  onClick: () => void
}

export default function HexTile({
  hex,
  isSelected,
  showNumber,
  onClick
}: HexTileProps) {
  // Create points for hex polygon
  const points = hex.vertices
    .map(v => `${v.position.x},${v.position.y}`)
    .join(' ')

  return (
    <g className="hex-tile" onClick={onClick}>
      {/* Shadow for depth */}
      <polygon
        points={points}
        fill="black"
        opacity={0.2}
        transform="translate(3, 3)"
      />
      
      {/* Main hex shape */}
      <HexShape
        points={points}
        resource={hex.resource}
        isSelected={isSelected}
      />
      
      {/* Hex border */}
      <polygon
        points={points}
        fill="none"
        stroke="var(--hex-border)"
        strokeWidth={isSelected ? 3 : 1.5}
        strokeLinejoin="round"
        className={isSelected ? 'animate-pulse' : ''}
      />
      
      {/* Hex index (debug) */}
      {showNumber && (
        <text
          x={hex.position.x}
          y={hex.position.y - 25}
          textAnchor="middle"
          className="fill-hex-label text-sm font-mono font-semibold"
          style={{ pointerEvents: 'none' }}
        >
          {hex.index}
        </text>
      )}
      
      {/* Number token */}
      {hex.numberToken && !hex.hasRobber && (
        <HexNumber
          x={hex.position.x}
          y={hex.position.y + 15}
          number={hex.numberToken}
        />
      )}
      
      {/* Robber */}
      {hex.hasRobber && (
        <Robber
          x={hex.position.x}
          y={hex.position.y}
        />
      )}
      
      {/* Invisible click area */}
      <polygon
        points={points}
        fill="transparent"
        className="cursor-pointer hover:fill-white hover:fill-opacity-10"
      />
    </g>
  )
}