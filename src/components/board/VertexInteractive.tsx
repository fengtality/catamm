
import { GlobalVertex, VERTEX_RADIUS } from '@/models/board.models'

interface VertexInteractiveProps {
  vertex: GlobalVertex
  isPortable: boolean
  isSelected: boolean
  shouldPulse?: boolean
  onClick: () => void
}

export default function VertexInteractive({
  vertex,
  isPortable,
  isSelected,
  shouldPulse = false,
  onClick
}: VertexInteractiveProps) {
  const { x, y } = vertex.position
  const radius = VERTEX_RADIUS
  
  const fillColor = isSelected 
    ? 'var(--selection-primary)'
    : isPortable
      ? 'var(--selection-port)'
      : 'var(--background)'
  
  const strokeColor = 'var(--foreground)'

  return (
    <g className="vertex-interactive" onClick={onClick}>
      
      {/* Pulsing ring for setup guidance */}
      {shouldPulse && (
        <circle
          cx={x}
          cy={y}
          r={radius + 4}
          fill="none"
          stroke="var(--selection-primary)"
          strokeWidth={2}
          className="animate-setup-pulse"
        />
      )}
      
      {/* Main vertex circle */}
      <circle
        cx={x}
        cy={y}
        r={radius}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={isSelected ? 2 : 1}
        className=""
      />
      
      {/* Invisible click area */}
      <circle
        cx={x}
        cy={y}
        r={12}
        fill="transparent"
        className="cursor-pointer hover:fill-white hover:fill-opacity-10"
      />
    </g>
  )
}