
import { GlobalVertex, Building as BuildingModel } from '@/models/board.models'
import Building from './Building'
import VertexInteractive from './VertexInteractive'

interface VertexLayerProps {
  vertices: Map<string, GlobalVertex>
  buildings: Map<string, BuildingModel>
  portableVertices: Set<string>
  selectedVertex: string | null
  showVertices: boolean
  showPortable: boolean
  gamePhase?: string
  setupBuildings?: number
  onVertexClick: (vertexId: string | null) => void
}

export default function VertexLayer({
  vertices,
  buildings,
  portableVertices,
  selectedVertex,
  showVertices,
  showPortable,
  gamePhase,
  setupBuildings,
  onVertexClick
}: VertexLayerProps) {
  // Check if we should show pulsing effect
  const shouldPulse = gamePhase === 'setup' && setupBuildings === 0 && !selectedVertex
  return (
    <g className="vertex-layer">
      {/* Render buildings first */}
      {Array.from(buildings.entries()).map(([vertexId, building]) => {
        const vertex = vertices.get(vertexId)
        if (!vertex) return null
        
        return (
          <Building
            key={vertexId}
            vertex={vertex}
            building={building}
            isSelected={selectedVertex === vertexId}
            onClick={() => onVertexClick(vertexId)}
          />
        )
      })}
      
      {/* Render interactive vertices */}
      {Array.from(vertices.entries()).map(([vertexId, vertex]) => {
        // Skip if this vertex has a building
        if (buildings.has(vertexId)) return null
        
        const isPortable = portableVertices.has(vertexId)
        const shouldShow = showVertices || (showPortable && isPortable) || selectedVertex === vertexId
        
        if (!shouldShow) return null
        
        return (
          <VertexInteractive
            key={vertexId}
            vertex={vertex}
            isPortable={isPortable}
            isSelected={selectedVertex === vertexId}
            shouldPulse={shouldPulse}
            onClick={() => onVertexClick(vertexId)}
          />
        )
      })}
    </g>
  )
}