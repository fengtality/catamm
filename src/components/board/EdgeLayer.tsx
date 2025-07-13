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
      {/* Render roads first */}
      {Array.from(roads.entries()).map(([edgeId, player]) => {
        const edge = edges.get(edgeId)
        if (!edge) return null
        
        return (
          <Road
            key={edgeId}
            edge={edge}
            vertices={vertices}
            player={player}
          />
        )
      })}
      
      {/* Render interactive edges */}
      {Array.from(edges.entries()).map(([edgeId, edge]) => {
        // Skip if this edge has a road
        if (roads.has(edgeId)) return null
        
        return (
          <EdgeInteractive
            key={edgeId}
            edge={edge}
            vertices={vertices}
            isSelected={selectedEdge === edgeId}
            onClick={() => onEdgeClick(edgeId)}
          />
        )
      })}
    </g>
  )
}