import React from 'react'
import { GlobalEdge, GlobalVertex } from '@/models/board.models'
import Road from './Road'
import EdgeInteractive from './EdgeInteractive'

interface EdgeLayerProps {
  edges: Map<string, GlobalEdge>
  vertices: Map<string, GlobalVertex>
  roads: Map<string, number>
  selectedEdge: string | null
  onEdgeClick: (edgeId: string | null) => void
}

export default function EdgeLayer({
  edges,
  vertices,
  roads,
  selectedEdge,
  onEdgeClick
}: EdgeLayerProps) {
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
              onClick={() => onEdgeClick(edgeId)}
            />
          )
        }
      })}
    </g>
  )
}