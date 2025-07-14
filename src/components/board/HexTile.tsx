
import { Hex, HEX_RADIUS } from '@/models/board.models'
import HexShape from './HexShape'
import HexNumber from './HexNumber'
import Robber from './Robber'

interface HexTileProps {
  hex: Hex
  isSelected: boolean
  showNumber: boolean
  isSelectable?: boolean
  onClick?: () => void
}

export default function HexTile({
  hex,
  isSelected,
  showNumber,
  isSelectable = false,
  onClick
}: HexTileProps) {
  // Create points for hex polygon
  const points = hex.vertices
    .map(v => `${v.position.x},${v.position.y}`)
    .join(' ')

  return (
    <g className="hex-tile" onClick={isSelectable ? onClick : undefined}>
      {/* Main hex shape */}
      <HexShape
        points={points}
        resource={hex.resource}
        isSelected={isSelected}
        hasRobber={hex.hasRobber}
      />
      
      {/* Hex border */}
      <polygon
        points={points}
        fill="none"
        stroke="var(--hex-border)"
        strokeWidth={isSelected ? 2.5 : 1.5}
        strokeLinejoin="round"
      />
      
      {/* Hex index */}
      {showNumber && (
        <text
          x={hex.position.x}
          y={hex.position.y - HEX_RADIUS + 30}
          textAnchor="middle"
          fill="white"
          stroke="black"
          strokeWidth="1"
          fontSize="32"
          fontWeight="bold"
          fontFamily="monospace"
          style={{ pointerEvents: 'none' }}
        >
          {hex.index}
        </text>
      )}
      
      {/* Number token */}
      {hex.numberToken && !hex.hasRobber && (
        <HexNumber
          x={hex.position.x}
          y={hex.position.y}
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
      
      {/* Invisible click area - only when selectable */}
      {isSelectable && (
        <polygon
          points={points}
          fill="transparent"
          className="cursor-pointer hover:fill-white hover:fill-opacity-10"
        />
      )}
    </g>
  )
}