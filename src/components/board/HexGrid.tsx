import React from 'react'
import { Hex } from '@/models/board.models'
import HexTile from './HexTile'

interface HexGridProps {
  hexes: Hex[]
  selectedHex: number | null
  showHexNumbers: boolean
  onHexClick: (hexIndex: number | null) => void
}

export default function HexGrid({
  hexes,
  selectedHex,
  showHexNumbers,
  onHexClick
}: HexGridProps) {
  return (
    <g className="hex-grid">
      {hexes.map(hex => (
        <HexTile
          key={hex.index}
          hex={hex}
          isSelected={selectedHex === hex.index}
          showNumber={showHexNumbers}
          onClick={() => onHexClick(hex.index)}
        />
      ))}
    </g>
  )
}