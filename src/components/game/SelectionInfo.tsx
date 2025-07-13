
import React from 'react'
import { Board } from '@/models/board.models'
import { getPortableVertices, getPerimeterEdges } from '@/models/board.initialization'

interface SelectionInfoProps {
  board: Board | null
  selectedHex: number | null
  selectedVertex: string | null
  selectedEdge: string | null
}

export default function SelectionInfo({
  board,
  selectedHex,
  selectedVertex,
  selectedEdge
}: SelectionInfoProps) {
  return (
    <div className="p-4 bg-gray-50 min-h-[200px]">
      <h3 className="text-lg font-semibold mb-3">Selection Info</h3>
      
      {!selectedHex && !selectedVertex && !selectedEdge && (
        <p className="text-gray-500 text-sm">
          Click on hexes, vertices, or edges to view details
        </p>
      )}
      
      {selectedHex !== null && board && (
        <div className="space-y-2 text-sm">
          <h4 className="font-medium text-gray-700">Hex {selectedHex}</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="font-medium">Resource:</span>{' '}
              {board.hexes[selectedHex].resource || 'Desert'}
            </div>
            <div>
              <span className="font-medium">Number:</span>{' '}
              {board.hexes[selectedHex].numberToken || 'None'}
            </div>
          </div>
          <div>
            <span className="font-medium">Neighbors:</span>{' '}
            {board.hexes[selectedHex].neighbors.join(', ')}
          </div>
        </div>
      )}
      
      {selectedVertex && board && (() => {
        const vertex = board.globalVertices.get(selectedVertex)
        if (!vertex) return null
        const isPortable = getPortableVertices(board).includes(selectedVertex)
        
        return (
          <div className="space-y-2 text-sm">
            <h4 className="font-medium text-gray-700">
              Vertex {selectedVertex}
              {isPortable && (
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                  PORTABLE
                </span>
              )}
            </h4>
            <div>
              <span className="font-medium">Position:</span>{' '}
              ({vertex.position.x.toFixed(0)}, {vertex.position.y.toFixed(0)})
            </div>
            <div>
              <span className="font-medium">Shared by:</span>{' '}
              {vertex.hexes.map(h => `Hex ${h.hexIndex}`).join(', ')}
            </div>
          </div>
        )
      })()}
      
      {selectedEdge && board && (() => {
        const edge = board.globalEdges.get(selectedEdge)
        if (!edge) return null
        const isPerimeter = getPerimeterEdges(board).includes(selectedEdge)
        
        return (
          <div className="space-y-2 text-sm">
            <h4 className="font-medium text-gray-700">
              Edge {selectedEdge}
              {isPerimeter && (
                <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                  PERIMETER
                </span>
              )}
            </h4>
            <div>
              <span className="font-medium">Connects:</span>{' '}
              {edge.vertices.join(' ↔ ')}
            </div>
            <div>
              <span className="font-medium">Shared by:</span>{' '}
              {edge.hexes.map(h => `Hex ${h.hexIndex}`).join(', ')}
            </div>
          </div>
        )
      })()}
    </div>
  )
}