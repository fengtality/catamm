
import { Hex } from '@/models/board.models'
import HexTile from './HexTile'

interface HexGridProps {
  hexes: Hex[]
  selectedHex: number | null
  showHexNumbers: boolean
  isMovingRobber?: boolean
  onHexClick: (hexIndex: number | null) => void
}

export default function HexGrid({
  hexes,
  selectedHex,
  showHexNumbers,
  isMovingRobber = false,
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
          isSelectable={isMovingRobber}
          onClick={() => isMovingRobber ? onHexClick(hex.index) : undefined}
        />
      ))}
    </g>
  )
}