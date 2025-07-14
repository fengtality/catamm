
import { 
  GlobalVertex, 
  Building as BuildingModel, 
  BuildingType,
  BUILDING_SETTLEMENT_SIZE,
  BUILDING_CITY_SIZE
} from '@/models/board.models'

interface BuildingProps {
  vertex: GlobalVertex
  building: BuildingModel
  isSelected: boolean
  onClick: () => void
}

export default function Building({ vertex, building, isSelected, onClick }: BuildingProps) {
  const { x, y } = vertex.position
  const playerColor = `var(--player-${building.player})`
  
  if (building.type === BuildingType.Settlement) {
    const size = BUILDING_SETTLEMENT_SIZE
    const halfSize = size / 2
    const roofHeight = size * 0.5
    const wallHeight = size * 0.67
    
    return (
      <g className="settlement" onClick={onClick} style={{ cursor: 'pointer' }}>
        {/* Shadow */}
        <path
          d={`
            M ${x} ${y - roofHeight}
            L ${x + halfSize} ${y - roofHeight/3}
            L ${x + halfSize} ${y + wallHeight/2}
            L ${x - halfSize} ${y + wallHeight/2}
            L ${x - halfSize} ${y - roofHeight/3}
            Z
          `}
          fill="var(--shadow-medium)"
          transform="translate(4, 4)"
        />
        
        {/* Main building */}
        <path
          d={`
            M ${x} ${y - roofHeight}
            L ${x + halfSize} ${y - roofHeight/3}
            L ${x + halfSize} ${y + wallHeight/2}
            L ${x - halfSize} ${y + wallHeight/2}
            L ${x - halfSize} ${y - roofHeight/3}
            Z
          `}
          fill={playerColor}
          stroke={isSelected ? 'var(--selection-primary)' : 'var(--background)'}
          strokeWidth={isSelected ? 4 : 2}
          strokeLinejoin="round"
          className=""
        />
        
        {/* Roof highlight */}
        <path
          d={`
            M ${x - halfSize * 0.8} ${y - roofHeight/4}
            L ${x} ${y - roofHeight * 0.8}
            L ${x + halfSize * 0.8} ${y - roofHeight/4}
          `}
          stroke={playerColor}
          strokeWidth={2}
          fill="none"
          opacity={0.5}
          style={{ filter: 'brightness(1.5)' }}
        />
      </g>
    )
  } else {
    // City - Simple castle silhouette
    const size = BUILDING_CITY_SIZE
    const halfSize = size / 2
    const towerWidth = size * 0.3
    const towerHeight = size * 0.25
    
    return (
      <g className="city" onClick={onClick} style={{ cursor: 'pointer' }}>
        {/* Shadow */}
        <path
          d={`
            M ${x - halfSize} ${y - halfSize + towerHeight}
            L ${x - halfSize} ${y + halfSize}
            L ${x + halfSize} ${y + halfSize}
            L ${x + halfSize} ${y - halfSize + towerHeight}
            L ${x + halfSize} ${y - halfSize}
            L ${x + halfSize - towerWidth} ${y - halfSize}
            L ${x + halfSize - towerWidth} ${y - halfSize + towerHeight}
            L ${x - halfSize + towerWidth} ${y - halfSize + towerHeight}
            L ${x - halfSize + towerWidth} ${y - halfSize}
            L ${x - halfSize} ${y - halfSize}
            Z
          `}
          fill="var(--shadow-medium)"
          transform="translate(4, 4)"
        />
        
        {/* Main castle shape */}
        <path
          d={`
            M ${x - halfSize} ${y - halfSize + towerHeight}
            L ${x - halfSize} ${y + halfSize}
            L ${x + halfSize} ${y + halfSize}
            L ${x + halfSize} ${y - halfSize + towerHeight}
            L ${x + halfSize} ${y - halfSize}
            L ${x + halfSize - towerWidth} ${y - halfSize}
            L ${x + halfSize - towerWidth} ${y - halfSize + towerHeight}
            L ${x - halfSize + towerWidth} ${y - halfSize + towerHeight}
            L ${x - halfSize + towerWidth} ${y - halfSize}
            L ${x - halfSize} ${y - halfSize}
            Z
          `}
          fill={playerColor}
          stroke={isSelected ? 'var(--selection-primary)' : 'var(--background)'}
          strokeWidth={isSelected ? 4 : 2}
          strokeLinejoin="round"
        />
        
        {/* Castle highlight detail */}
        <line
          x1={x - halfSize + towerWidth}
          y1={y - halfSize + towerHeight * 1.5}
          x2={x + halfSize - towerWidth}
          y2={y - halfSize + towerHeight * 1.5}
          stroke={playerColor}
          strokeWidth={2}
          opacity={0.5}
          style={{ filter: 'brightness(1.5)' }}
        />
      </g>
    )
  }
}