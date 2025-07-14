import React, { useRef, useState, useCallback } from 'react'
import { Board, CANVAS_WIDTH, CANVAS_HEIGHT } from '@/models/board.models'
import { ViewOptions } from '../shared/types'
import HexGrid from './HexGrid'
import EdgeLayer from './EdgeLayer'
import VertexLayer from './VertexLayer'
import { getPortableVertices } from '@/models/board.initialization'

interface BoardSVGProps {
  board: Board | null
  selectedHex: number | null
  selectedVertex: string | null
  selectedEdge: string | null
  viewOptions: ViewOptions
  isMovingRobber?: boolean
  gamePhase?: string
  setupBuildings?: number
  currentPlayer?: number
  onHexClick: (hexIndex: number | null) => void
  onVertexClick: (vertexId: string | null) => void
  onEdgeClick: (edgeId: string | null) => void
}

export default function BoardSVG({
  board,
  selectedHex,
  selectedVertex,
  selectedEdge,
  viewOptions,
  isMovingRobber = false,
  gamePhase,
  setupBuildings,
  currentPlayer,
  onHexClick,
  onVertexClick,
  onEdgeClick
}: BoardSVGProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: CANVAS_WIDTH, height: CANVAS_HEIGHT })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)

  // Get portable vertices
  const portableVertices = board ? new Set(getPortableVertices(board)) : new Set<string>()

  // Handle mouse events for panning
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) { // Left button only
      setIsPanning(true)
      setPanStart({ x: e.clientX, y: e.clientY })
    }
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return

    const dx = (e.clientX - panStart.x) / scale
    const dy = (e.clientY - panStart.y) / scale

    setViewBox(prev => ({
      ...prev,
      x: prev.x - dx,
      y: prev.y - dy
    }))

    setPanStart({ x: e.clientX, y: e.clientY })
  }, [isPanning, panStart, scale])

  const handleMouseUp = useCallback(() => {
    setIsPanning(false)
  }, [])

  // Handle wheel events for zooming
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    
    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9
    const newScale = Math.max(0.5, Math.min(2, scale * zoomFactor))
    
    if (newScale !== scale) {
      // Get mouse position relative to SVG
      const rect = svgRef.current?.getBoundingClientRect()
      if (!rect) return

      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      // Convert to SVG coordinates
      const svgX = viewBox.x + (mouseX / rect.width) * viewBox.width
      const svgY = viewBox.y + (mouseY / rect.height) * viewBox.height

      // Calculate new viewBox to zoom around mouse position
      const newWidth = CANVAS_WIDTH / newScale
      const newHeight = CANVAS_HEIGHT / newScale
      const newX = svgX - (mouseX / rect.width) * newWidth
      const newY = svgY - (mouseY / rect.height) * newHeight

      setViewBox({
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight
      })
      setScale(newScale)
    }
  }, [scale, viewBox])

  // Handle global click for deselection
  const handleSVGClick = useCallback((e: React.MouseEvent) => {
    // Only deselect if clicking on the background
    if (e.target === e.currentTarget) {
      onHexClick(null)
      onVertexClick(null)
      onEdgeClick(null)
    }
  }, [onHexClick, onVertexClick, onEdgeClick])

  if (!board) return null

  return (
    <div className="w-full h-full">
      <svg
        ref={svgRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onClick={handleSVGClick}
      >
        {/* Hex layer (bottom) */}
        <HexGrid
          hexes={board.hexes}
          selectedHex={selectedHex}
          showHexNumbers={viewOptions.showHexNumbers}
          isMovingRobber={isMovingRobber}
          onHexClick={onHexClick}
        />

        {/* Edge layer (middle) */}
        <EdgeLayer
          edges={board.globalEdges}
          vertices={board.globalVertices}
          roads={board.roads}
          buildings={board.buildings}
          selectedEdge={selectedEdge}
          gamePhase={gamePhase}
          setupBuildings={setupBuildings}
          currentPlayer={currentPlayer}
          onEdgeClick={onEdgeClick}
        />

        {/* Vertex layer (top) */}
        <VertexLayer
          vertices={board.globalVertices}
          buildings={board.buildings}
          portableVertices={portableVertices}
          selectedVertex={selectedVertex}
          showVertices={viewOptions.showVertices}
          showPortable={viewOptions.showPortable}
          gamePhase={gamePhase}
          setupBuildings={setupBuildings}
          onVertexClick={onVertexClick}
        />
      </svg>
    </div>
  )
}