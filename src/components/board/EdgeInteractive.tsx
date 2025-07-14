
import { GlobalEdge, GlobalVertex } from '@/models/board.models'

interface EdgeInteractiveProps {
  edge: GlobalEdge
  vertices: Map<string, GlobalVertex>
  isSelected: boolean
  shouldPulse?: boolean
  isValidPlacement?: boolean
  onClick: () => void
}

export default function EdgeInteractive({
  edge,
  vertices,
  isSelected,
  shouldPulse = false,
  isValidPlacement = true,
  onClick
}: EdgeInteractiveProps) {
  const v1 = vertices.get(edge.vertices[0])
  const v2 = vertices.get(edge.vertices[1])
  
  if (!v1 || !v2) return null
  
  const isPerimeter = edge.hexes.length === 1
  
  return (
    <g className="edge-interactive" onClick={onClick}>
      {/* Pulsing edge for setup guidance */}
      {shouldPulse && (
        <line
          x1={v1.position.x}
          y1={v1.position.y}
          x2={v2.position.x}
          y2={v2.position.y}
          stroke="var(--selection-primary)"
          strokeWidth={8}
          strokeLinecap="round"
          className="animate-setup-pulse"
        />
      )}
      
      {/* Visible edge line */}
      <line
        x1={v1.position.x}
        y1={v1.position.y}
        x2={v2.position.x}
        y2={v2.position.y}
        stroke={
          isSelected 
            ? 'var(--selection-primary)' 
            : isPerimeter 
              ? 'var(--edge-perimeter)' 
              : 'var(--edge-default)'
        }
        strokeWidth={isSelected ? 6 : isPerimeter ? 1.5 : 1}
        strokeLinecap="round"
        className=""
        opacity={isValidPlacement ? 1 : 0.3}
      />
      
      {/* Invisible click area */}
      <line
        x1={v1.position.x}
        y1={v1.position.y}
        x2={v2.position.x}
        y2={v2.position.y}
        stroke="transparent"
        strokeWidth={12}
        strokeLinecap="round"
        className={isValidPlacement ? "cursor-pointer hover:stroke-white hover:stroke-opacity-20" : "cursor-not-allowed"}
        style={{ pointerEvents: 'stroke' }}
      />
    </g>
  )
}