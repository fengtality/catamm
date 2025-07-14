
import { GlobalEdge, GlobalVertex, Building } from '@/models/board.models'
import Road from './Road'
import EdgeInteractive from './EdgeInteractive'

interface EdgeLayerProps {
  edges: Map<string, GlobalEdge>
  vertices: Map<string, GlobalVertex>
  roads: Map<string, number>
  buildings: Map<string, Building>
  selectedEdge: string | null
  gamePhase?: string
  setupBuildings?: number
  currentPlayer?: number
  onEdgeClick: (edgeId: string | null) => void
}

export default function EdgeLayer({
  edges,
  vertices,
  roads,
  buildings,
  selectedEdge,
  gamePhase,
  setupBuildings,
  currentPlayer,
  onEdgeClick
}: EdgeLayerProps) {
  // Check if we should show pulsing effect
  const shouldShowPulse = gamePhase === 'setup' && setupBuildings === 1 && !selectedEdge
  
  // Find edges adjacent to current player's buildings
  const validEdgesForRoad = new Set<string>()
  if (currentPlayer !== undefined) {
    // For each building owned by current player
    buildings.forEach((building, vertexId) => {
      if (building.player === currentPlayer) {
        // Find all edges that include this vertex
        edges.forEach((edge, edgeId) => {
          if (edge.vertices.includes(vertexId) && !roads.has(edgeId)) {
            validEdgesForRoad.add(edgeId)
          }
        })
      }
    })
  }
  return (
    <g className="edge-layer">
      {/* Render all edges with appropriate styling */}
      {Array.from(edges.entries()).map(([edgeId, edge]) => {
        const hasRoad = roads.has(edgeId)
        const player = roads.get(edgeId)
        
        if (hasRoad && player !== undefined) {
          // Render as a road
          return (
            <Road
              key={edgeId}
              edge={edge}
              vertices={vertices}
              player={player}
            />
          )
        } else {
          // Render as an interactive edge
          return (
            <EdgeInteractive
              key={edgeId}
              edge={edge}
              vertices={vertices}
              isSelected={selectedEdge === edgeId}
              shouldPulse={shouldShowPulse && validEdgesForRoad.has(edgeId)}
              isValidPlacement={!shouldShowPulse || validEdgesForRoad.has(edgeId)}
              onClick={() => {
                // Only allow clicking valid edges during setup road placement
                if (gamePhase === 'setup' && setupBuildings === 1 && !validEdgesForRoad.has(edgeId)) {
                  return
                }
                onEdgeClick(edgeId)
              }}
            />
          )
        }
      })}
    </g>
  )
}