
import React from 'react'
import { Board, BuildingType } from '@/models/board.models'
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
  const renderContent = () => {
    if (!selectedHex && !selectedVertex && !selectedEdge) {
      return (
        <p className="text-muted-foreground text-sm font-mono">
          Click on hexes, vertices, or edges to view details
        </p>
      )
    }
    
    if (selectedHex !== null && board) {
      const hex = board.hexes[selectedHex]
      return (
        <div className="flex items-center space-x-6 text-sm font-mono">
          <h4 className="font-semibold">Hex {selectedHex}</h4>
          <div className="flex items-center space-x-2">
            <span className="text-muted-foreground">Resource:</span>
            <span className="font-medium">{hex.resource || 'Desert'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-muted-foreground">Number:</span>
            <span className="font-medium">{hex.numberToken || 'None'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-muted-foreground">Neighbors:</span>
            <span className="font-medium">{hex.neighbors.join(', ')}</span>
          </div>
        </div>
      )
    }
    
    if (selectedVertex && board) {
      const vertex = board.globalVertices.get(selectedVertex)
      if (!vertex) return null
      
      // Check if this vertex has a building
      const building = board.buildings.get(selectedVertex)
      if (building) {
        return (
          <div className="flex items-center space-x-6 text-sm font-mono">
            <h4 className="font-semibold">
              {building.type === BuildingType.Settlement ? 'Settlement' : 'City'}
            </h4>
            <div className="flex items-center space-x-2">
              <span className="text-muted-foreground">Owner:</span>
              <span className="font-medium">Player {building.player}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-muted-foreground">Victory Points:</span>
              <span className="font-medium">{building.type === BuildingType.Settlement ? '1' : '2'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-muted-foreground">Location:</span>
              <span className="font-medium">Vertex {selectedVertex}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-muted-foreground">Adjacent Hexes:</span>
              <span className="font-medium">{vertex.hexes.map(h => h.hexIndex).join(', ')}</span>
            </div>
          </div>
        )
      }
      
      const isPortable = getPortableVertices(board).includes(selectedVertex)
      
      // For portable vertices, show AMM info
      if (isPortable) {
        // Mock AMM data - in real implementation, this would come from game state
        const ammData = {
          pair: 'Wood/Brick',
          status: 'Active',
          liquidity: '100/150',
          owner: 'Player 2'
        }
        
        return (
          <div className="flex items-center space-x-6 text-sm font-mono">
            <h4 className="font-semibold">
              Portable Vertex {selectedVertex}
            </h4>
            <div className="flex items-center space-x-2">
              <span className="text-muted-foreground">AMM:</span>
              <span className="font-medium">{ammData.pair}</span>
              <span className={`px-2 py-0.5 text-xs rounded ${
                ammData.status === 'Active' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {ammData.status}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-muted-foreground">Liquidity:</span>
              <span className="font-medium">{ammData.liquidity}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-muted-foreground">Owner:</span>
              <span className="font-medium">{ammData.owner}</span>
            </div>
          </div>
        )
      }
      
      // Regular vertex info
      return (
        <div className="flex items-center space-x-6 text-sm font-mono">
          <h4 className="font-semibold">Vertex {selectedVertex}</h4>
          <div className="flex items-center space-x-2">
            <span className="text-muted-foreground">Position:</span>
            <span className="font-medium">({vertex.position.x.toFixed(0)}, {vertex.position.y.toFixed(0)})</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-muted-foreground">Shared by:</span>
            <span className="font-medium">{vertex.hexes.map(h => `Hex ${h.hexIndex}`).join(', ')}</span>
          </div>
        </div>
      )
    }
    
    if (selectedEdge && board) {
      const edge = board.globalEdges.get(selectedEdge)
      if (!edge) return null
      const isPerimeter = getPerimeterEdges(board).includes(selectedEdge)
      
      return (
        <div className="flex items-center space-x-6 text-sm font-mono">
          <h4 className="font-semibold">
            Edge {selectedEdge}
            {isPerimeter && (
              <span className="ml-2 px-2 py-0.5 bg-destructive text-destructive-foreground text-xs rounded">
                PERIMETER
              </span>
            )}
          </h4>
          <div className="flex items-center space-x-2">
            <span className="text-muted-foreground">Connects:</span>
            <span className="font-medium">{edge.vertices.join(' ↔ ')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-muted-foreground">Shared by:</span>
            <span className="font-medium">{edge.hexes.map(h => `Hex ${h.hexIndex}`).join(', ')}</span>
          </div>
        </div>
      )
    }
    
    return null
  }
  
  return (
    <div className="bg-background border-t border-border p-4 h-20 flex items-center">
      <div className="flex items-center space-x-4 w-full">
        <h3 className="text-sm font-mono font-semibold text-muted-foreground">Selection Info</h3>
        <div className="flex-1">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}