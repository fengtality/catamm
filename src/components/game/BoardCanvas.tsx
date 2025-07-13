
import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Board, Hex, GlobalVertex, GlobalEdge, HEX_EDGES, BuildingType, Building } from '@/models/board.models'
import { 
  getPerimeterEdges, 
  getPerimeterVertices,
  getPortableVertices
} from '@/models/board.initialization'
import { Resource } from '@/types'
import { ViewOptions } from '../shared/types'

interface BoardCanvasProps {
  board: Board | null
  selectedHex: number | null
  selectedVertex: string | null
  selectedEdge: string | null
  viewOptions: ViewOptions
  onHexClick: (hexIndex: number | null) => void
  onVertexClick: (vertexId: string | null) => void
  onEdgeClick: (edgeId: string | null) => void
}

export default function BoardCanvas({
  board,
  selectedHex,
  selectedVertex,
  selectedEdge,
  viewOptions,
  onHexClick,
  onVertexClick,
  onEdgeClick
}: BoardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [lastPan, setLastPan] = useState({ x: 0, y: 0 })
  const [darkMode, setDarkMode] = useState(false)

  const CANVAS_WIDTH = 3000
  const CANVAS_HEIGHT = 3000

  // Helper to get CSS variable value
  const getCSSVar = (name: string): string => {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
    // Convert OKLCH to usable format
    if (value.startsWith('oklch')) {
      return `oklch(${value.slice(6, -1)})`
    }
    return value
  }

  // Watch for dark mode changes
  useEffect(() => {
    const checkDarkMode = () => {
      setDarkMode(document.documentElement.classList.contains('dark'))
    }
    
    checkDarkMode() // Initial check
    
    // Watch for changes
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    })
    
    return () => observer.disconnect()
  }, [])

  const RESOURCE_COLORS: Record<Resource, string> = {
    [Resource.Wood]: '#2D5016',  // Deep forest green
    [Resource.Brick]: '#B8584D',  // Terracotta red
    [Resource.Sheep]: '#83C55B',  // Pasture green
    [Resource.Wheat]: '#F4C842',  // Golden wheat
    [Resource.Ore]: '#7A7A7A'     // Mountain gray
  }

  const PLAYER_COLORS = ['#FF0000', '#0000FF', '#FFA500', '#FFFFFF']

  // Helper function to adjust color brightness
  function adjustBrightness(color: string, amount: number): string {
    const hex = color.replace('#', '')
    const num = parseInt(hex, 16)
    const r = Math.min(255, Math.max(0, (num >> 16) + amount))
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount))
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount))
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')
  }

  // Get number of probability dots for a number token
  function getProbabilityDots(number: number): number {
    const dotMap: Record<number, number> = {
      2: 1,
      3: 2,
      4: 3,
      5: 4,
      6: 5,
      8: 5,
      9: 4,
      10: 3,
      11: 2,
      12: 1
    }
    return dotMap[number] || 0
  }

  // Mouse event handlers
  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true)
    setDragStart({ x: event.clientX, y: event.clientY })
    setLastPan({ ...pan })
  }, [pan])

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return
    
    const dx = event.clientX - dragStart.x
    const dy = event.clientY - dragStart.y
    setPan({
      x: lastPan.x + dx,
      y: lastPan.y + dy
    })
  }, [isDragging, dragStart, lastPan])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!board || !canvasRef.current || isDragging) return
    
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    
    // Calculate the scale factor between display size and actual canvas size
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    // Get click position relative to canvas
    const canvasX = (event.clientX - rect.left) * scaleX
    const canvasY = (event.clientY - rect.top) * scaleY
    
    // Convert canvas coordinates to world coordinates (accounting for pan)
    const x = canvasX - pan.x
    const y = canvasY - pan.y
    
    // Check for vertex click first (smaller target)
    for (const [id, vertex] of board.globalVertices) {
      const dx = x - vertex.position.x
      const dy = y - vertex.position.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance < 10) {
        onVertexClick(id)
        return
      }
    }
    
    // Check for edge click
    for (const [id, edge] of board.globalEdges) {
      const v1 = board.globalVertices.get(edge.vertices[0])
      const v2 = board.globalVertices.get(edge.vertices[1])
      if (!v1 || !v2) continue
      
      // Calculate distance from point to line segment
      const A = x - v1.position.x
      const B = y - v1.position.y
      const C = v2.position.x - v1.position.x
      const D = v2.position.y - v1.position.y
      
      const dot = A * C + B * D
      const lenSq = C * C + D * D
      let param = -1
      
      if (lenSq !== 0) param = dot / lenSq
      
      let xx, yy
      
      if (param < 0) {
        xx = v1.position.x
        yy = v1.position.y
      } else if (param > 1) {
        xx = v2.position.x
        yy = v2.position.y
      } else {
        xx = v1.position.x + param * C
        yy = v1.position.y + param * D
      }
      
      const dx = x - xx
      const dy = y - yy
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance < 8) {
        onEdgeClick(id)
        return
      }
    }
    
    // Check for hex click
    for (const hex of board.hexes) {
      const dx = x - hex.position.x
      const dy = y - hex.position.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance < 50) {
        onHexClick(hex.index)
        return
      }
    }
    
    // Clear selection if clicked on empty space
    onHexClick(null)
    onVertexClick(null)
    onEdgeClick(null)
  }, [board, isDragging, pan, onHexClick, onVertexClick, onEdgeClick])

  // Drawing functions
  const drawHex = (ctx: CanvasRenderingContext2D, hex: Hex, viewOptions: ViewOptions) => {
    const { x, y } = hex.position
    
    // Draw hexagon shape
    ctx.beginPath()
    hex.vertices.forEach((vertex, i) => {
      if (i === 0) ctx.moveTo(vertex.position.x, vertex.position.y)
      else ctx.lineTo(vertex.position.x, vertex.position.y)
    })
    ctx.closePath()
    
    // Apply shadow effect - enhanced for selected hex
    if (selectedHex === hex.index) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
      ctx.shadowBlur = 15
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
    } else {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
      ctx.shadowBlur = 8
      ctx.shadowOffsetX = 3
      ctx.shadowOffsetY = 3
    }
    
    // Fill with resource color - brighten if selected
    const isSelected = selectedHex === hex.index
    const brightnessAdjust = isSelected ? 40 : 0
    
    if (hex.resource) {
      const baseColor = RESOURCE_COLORS[hex.resource]
      ctx.fillStyle = adjustBrightness(baseColor, brightnessAdjust)
    } else {
      // Desert color
      const desertColor = '#E5D6C3'
      ctx.fillStyle = adjustBrightness(desertColor, brightnessAdjust)
    }
    ctx.fill()
    
    // Reset shadow for border
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
    
    // Draw subtle border for all hexes
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)'
    ctx.lineWidth = 1.5
    ctx.stroke()
    
    // Draw hex index if enabled
    if (viewOptions.showHexNumbers) {
      ctx.save()
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
      ctx.font = '600 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
      ctx.shadowBlur = 2
      ctx.shadowOffsetX = 1
      ctx.shadowOffsetY = 1
      ctx.fillText(hex.index.toString(), x, y - 25)
      ctx.restore()
    }
    
    // Draw number token
    if (hex.numberToken) {
      // Draw number token with elegant design
      ctx.save()
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
      ctx.shadowBlur = 4
      ctx.shadowOffsetX = 2
      ctx.shadowOffsetY = 2
      
      ctx.beginPath()
      ctx.arc(x, y + 15, 22, 0, 2 * Math.PI)
      
      // Gradient for token
      const tokenGradient = ctx.createRadialGradient(x - 5, y + 10, 0, x, y + 15, 22)
      tokenGradient.addColorStop(0, '#FFFEF7')
      tokenGradient.addColorStop(0.6, '#FFF8DC')
      tokenGradient.addColorStop(1, '#E8D4B0')
      ctx.fillStyle = tokenGradient
      ctx.fill()
      
      ctx.strokeStyle = '#8B6F47'
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.restore()
      
      // Draw number - red for 6 and 8, probability-based shading for others
      const isRed = hex.numberToken === 6 || hex.numberToken === 8
      const dots = getProbabilityDots(hex.numberToken)
      
      // Calculate color based on probability
      let textColor: string
      if (isRed) {
        textColor = '#C62828' // Red for 6 and 8
      } else {
        // Map dots (1-4) to grayscale values
        const grayValue = Math.round(140 - (dots * 30))
        textColor = `rgb(${grayValue}, ${grayValue}, ${grayValue})`
      }
      
      ctx.save()
      ctx.fillStyle = textColor
      ctx.font = '700 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'
      ctx.shadowBlur = 1
      ctx.shadowOffsetY = 1
      ctx.fillText(hex.numberToken.toString(), x, y + 15)
      ctx.restore()
    }
    
    // Draw robber figurine
    if (hex.hasRobber) {
      ctx.save()
      
      // Robber shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
      ctx.shadowBlur = 8
      ctx.shadowOffsetX = 4
      ctx.shadowOffsetY = 4
      
      // Draw robber body (cone shape)
      const robberHeight = 40
      const robberBaseWidth = 25
      const robberTopWidth = 15
      
      // Body gradient
      const bodyGradient = ctx.createLinearGradient(
        x - robberTopWidth/2, y - robberHeight/2,
        x + robberTopWidth/2, y + robberHeight/2
      )
      bodyGradient.addColorStop(0, '#3A3A3A')
      bodyGradient.addColorStop(0.3, '#2C2C2C')
      bodyGradient.addColorStop(0.7, '#1A1A1A')
      bodyGradient.addColorStop(1, '#000000')
      
      // Draw body
      ctx.beginPath()
      ctx.moveTo(x - robberBaseWidth/2, y + robberHeight/2)
      ctx.lineTo(x - robberTopWidth/2, y - robberHeight/3)
      ctx.lineTo(x - robberTopWidth/2, y - robberHeight/2)
      ctx.lineTo(x + robberTopWidth/2, y - robberHeight/2)
      ctx.lineTo(x + robberTopWidth/2, y - robberHeight/3)
      ctx.lineTo(x + robberBaseWidth/2, y + robberHeight/2)
      ctx.closePath()
      ctx.fillStyle = bodyGradient
      ctx.fill()
      
      // Body outline
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 1.5
      ctx.stroke()
      
      ctx.restore()
      
      // Draw head (no shadow)
      ctx.save()
      const headRadius = 12
      const headY = y - robberHeight/2 - headRadius/2
      
      // Head gradient
      const headGradient = ctx.createRadialGradient(
        x - 3, headY - 3, 0,
        x, headY, headRadius
      )
      headGradient.addColorStop(0, '#4A4A4A')
      headGradient.addColorStop(0.7, '#2C2C2C')
      headGradient.addColorStop(1, '#1A1A1A')
      
      ctx.beginPath()
      ctx.arc(x, headY, headRadius, 0, Math.PI * 2)
      ctx.fillStyle = headGradient
      ctx.fill()
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 1.5
      ctx.stroke()
      
      // Add highlight on body for 3D effect
      ctx.beginPath()
      ctx.moveTo(x - robberTopWidth/3, y - robberHeight/3)
      ctx.lineTo(x - robberTopWidth/4, y - robberHeight/2.5)
      ctx.lineTo(x - robberBaseWidth/3, y + robberHeight/3)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
      ctx.lineWidth = 1.5
      ctx.stroke()
      
      // Add small highlight on head
      ctx.beginPath()
      ctx.arc(x - 3, headY - 3, 3, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.fill()
      
      ctx.restore()
    }
  }

  const drawVertices = (ctx: CanvasRenderingContext2D, hex: Hex) => {
    hex.vertices.forEach((vertex, index) => {
      const { x, y } = vertex.position
      
      // Find global vertex
      let globalVertex: GlobalVertex | null = null
      let globalId = ''
      
      if (board) {
        for (const [id, gv] of board.globalVertices) {
          if (gv.hexes.some(h => h.hexIndex === hex.index && h.vertexIndex === index)) {
            globalVertex = gv
            globalId = id
            break
          }
        }
      }
      
      // Determine if this is a portable vertex
      const isPortable = viewOptions.showPortable && 
        board && getPortableVertices(board).includes(globalId)
      
      // Only draw vertex circles for selected hex or if showing portable
      const isSelectedHex = selectedHex === hex.index
      const shouldDrawCircle = isSelectedHex || isPortable || selectedVertex === globalId
      
      if (shouldDrawCircle) {
        // Check if this is the selected portable vertex
        const isSelectedPortable = selectedVertex === globalId && isPortable
        
        // Draw vertex circle
        ctx.beginPath()
        const radius = isSelectedPortable ? 15 : 8 // Larger radius for selected portable
        ctx.arc(x, y, radius, 0, 2 * Math.PI)
        
        if (isSelectedPortable) {
          ctx.fillStyle = '#00FF00' // Bright green for selected portable
        } else if (selectedVertex === globalId) {
          ctx.fillStyle = '#0080FF' // Bright blue for selected vertex
        } else if (isPortable) {
          ctx.fillStyle = '#00FF00' // Green for portable vertices
        } else {
          ctx.fillStyle = '#FFF'
        }
        ctx.fill()
        
        ctx.strokeStyle = isSelectedPortable ? '#00CC00' : '#333'
        ctx.lineWidth = isSelectedPortable ? 3 : 1
        ctx.stroke()
        
        // Draw labels
        if (isSelectedPortable) {
          // Draw "P" label for selected portable vertex
          ctx.fillStyle = '#FFF'
          ctx.font = 'bold 16px Arial'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText('P', x, y)
        } else if (isSelectedHex && viewOptions.showVertices) {
          // Draw vertex number for selected hex
          ctx.fillStyle = '#000'
          ctx.font = 'bold 10px Arial'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(index.toString(), x, y)
        }
      }
    })
  }

  const drawGlobalEdges = (ctx: CanvasRenderingContext2D) => {
    if (!board) return
    
    const perimeterEdges = new Set(getPerimeterEdges(board))
    
    // Draw roads first
    board.roads.forEach((player, edgeId) => {
      const edge = board.globalEdges.get(edgeId)
      if (!edge) return
      
      const v1 = board.globalVertices.get(edge.vertices[0])
      const v2 = board.globalVertices.get(edge.vertices[1])
      if (!v1 || !v2) return
      
      ctx.save()
      
      // Draw road shadow
      ctx.beginPath()
      ctx.moveTo(v1.position.x, v1.position.y)
      ctx.lineTo(v2.position.x, v2.position.y)
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)'
      ctx.lineWidth = 10
      ctx.lineCap = 'round'
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'
      ctx.shadowBlur = 3
      ctx.shadowOffsetY = 2
      ctx.stroke()
      
      // Draw road
      ctx.beginPath()
      ctx.moveTo(v1.position.x, v1.position.y)
      ctx.lineTo(v2.position.x, v2.position.y)
      ctx.strokeStyle = PLAYER_COLORS[player - 1]
      ctx.lineWidth = 6
      ctx.lineCap = 'round'
      ctx.shadowBlur = 0
      ctx.stroke()
      
      // Add highlight
      const dx = v2.position.x - v1.position.x
      const dy = v2.position.y - v1.position.y
      const len = Math.sqrt(dx * dx + dy * dy)
      const nx = -dy / len * 2
      const ny = dx / len * 2
      
      ctx.beginPath()
      ctx.moveTo(v1.position.x + nx, v1.position.y + ny)
      ctx.lineTo(v2.position.x + nx, v2.position.y + ny)
      ctx.strokeStyle = adjustBrightness(PLAYER_COLORS[player - 1], 40)
      ctx.lineWidth = 1.5
      ctx.stroke()
      
      ctx.restore()
    })
    
    // Draw edges
    board.globalEdges.forEach((edge, id) => {
      // Skip if this edge is a road
      if (board.roads.has(id)) return
      
      const v1 = board.globalVertices.get(edge.vertices[0])
      const v2 = board.globalVertices.get(edge.vertices[1])
      
      if (!v1 || !v2) return
      
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(v1.position.x, v1.position.y)
      ctx.lineTo(v2.position.x, v2.position.y)
      ctx.lineCap = 'round'
      
      if (selectedEdge === id) {
        // Selected edge with glow
        ctx.shadowColor = '#00BFFF'
        ctx.shadowBlur = 8
        ctx.strokeStyle = '#00BFFF'
        ctx.lineWidth = 4
        ctx.stroke()
        
        // Core line
        ctx.shadowBlur = 0
        ctx.strokeStyle = '#66D9FF'
        ctx.lineWidth = 2
        ctx.stroke()
      } else if (viewOptions.showPortable && perimeterEdges.has(id)) {
        ctx.strokeStyle = 'rgba(150, 150, 150, 0.5)'
        ctx.lineWidth = 1.5
        ctx.stroke()
      } else {
        ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)'
        ctx.lineWidth = 1
        ctx.stroke()
      }
      ctx.restore()
    })
  }

  const drawBuildings = (ctx: CanvasRenderingContext2D) => {
    if (!board) return
    
    board.buildings.forEach((building, vertexId) => {
      const vertex = board.globalVertices.get(vertexId)
      if (!vertex) return
      
      const { x, y } = vertex.position
      const playerColor = PLAYER_COLORS[building.player - 1]
      
      ctx.save()
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)'
      ctx.shadowBlur = 4
      ctx.shadowOffsetX = 2
      ctx.shadowOffsetY = 2
      
      if (building.type === BuildingType.Settlement) {
        // Draw settlement with gradient
        const size = 12
        const gradient = ctx.createLinearGradient(
          x, y - size,
          x, y + 8
        )
        gradient.addColorStop(0, adjustBrightness(playerColor, 30))
        gradient.addColorStop(0.5, playerColor)
        gradient.addColorStop(1, adjustBrightness(playerColor, -30))
        
        ctx.beginPath()
        ctx.moveTo(x, y - size)
        ctx.lineTo(x + 10, y - 4)
        ctx.lineTo(x + 10, y + 8)
        ctx.lineTo(x - 10, y + 8)
        ctx.lineTo(x - 10, y - 4)
        ctx.closePath()
        
        ctx.fillStyle = gradient
        ctx.fill()
        ctx.strokeStyle = '#000'
        ctx.lineWidth = 2
        ctx.lineJoin = 'round'
        ctx.stroke()
        
        // Add roof highlight
        ctx.beginPath()
        ctx.moveTo(x - 8, y - 3)
        ctx.lineTo(x, y - 10)
        ctx.lineTo(x + 8, y - 3)
        ctx.strokeStyle = adjustBrightness(playerColor, 50)
        ctx.lineWidth = 1
        ctx.stroke()
      } else if (building.type === BuildingType.City) {
        // Draw city with gradient
        const size = 16
        const gradient = ctx.createLinearGradient(
          x, y - size,
          x, y + 10
        )
        gradient.addColorStop(0, adjustBrightness(playerColor, 30))
        gradient.addColorStop(0.5, playerColor)
        gradient.addColorStop(1, adjustBrightness(playerColor, -30))
        
        ctx.beginPath()
        ctx.moveTo(x - 12, y + 10)
        ctx.lineTo(x - 12, y - 2)
        ctx.lineTo(x - 8, y - 6)
        ctx.lineTo(x - 8, y - 10)
        ctx.lineTo(x - 4, y - 10)
        ctx.lineTo(x - 4, y - 6)
        ctx.lineTo(x, y - 10)
        ctx.lineTo(x, y - 6)
        ctx.lineTo(x + 4, y - 10)
        ctx.lineTo(x + 4, y - 6)
        ctx.lineTo(x + 8, y - 10)
        ctx.lineTo(x + 8, y - 6)
        ctx.lineTo(x + 12, y - 2)
        ctx.lineTo(x + 12, y + 10)
        ctx.closePath()
        
        ctx.fillStyle = gradient
        ctx.fill()
        ctx.strokeStyle = '#000'
        ctx.lineWidth = 2
        ctx.lineJoin = 'round'
        ctx.stroke()
        
        // Add tower highlights
        ctx.strokeStyle = adjustBrightness(playerColor, 50)
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(x - 6, y - 8)
        ctx.lineTo(x - 6, y - 4)
        ctx.moveTo(x + 6, y - 8)
        ctx.lineTo(x + 6, y - 4)
        ctx.stroke()
      }
      ctx.restore()
    })
  }

  // Main drawing effect
  useEffect(() => {
    if (!board || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    
    // Clear canvas with proper background
    ctx.fillStyle = darkMode ? '#18181b' : '#fafafa' // zinc-900 for dark, zinc-50 for light
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Save context state
    ctx.save()
    
    // Apply pan transformation
    ctx.translate(pan.x, pan.y)
    
    // Enable anti-aliasing
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    
    // Draw hexes first (filled shapes)
    board.hexes.forEach(hex => drawHex(ctx, hex, viewOptions))
    
    // Draw edges on top of hexes
    drawGlobalEdges(ctx)
    
    // Draw vertices on top
    if (viewOptions.showVertices) {
      // Draw non-selected hexes first
      board.hexes.forEach(hex => {
        if (hex.index !== selectedHex) {
          drawVertices(ctx, hex)
        }
      })
      // Draw selected hex last so its vertices are on top
      if (selectedHex !== null) {
        const selectedHexObj = board.hexes.find(h => h.index === selectedHex)
        if (selectedHexObj) {
          drawVertices(ctx, selectedHexObj)
        }
      }
    }
    
    // Draw buildings on top of everything
    drawBuildings(ctx)
    
    // Restore context state
    ctx.restore()
  }, [board, pan, selectedHex, selectedVertex, selectedEdge, viewOptions, darkMode])

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="bg-card cursor-grab active:cursor-grabbing shadow-none border border-border"
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain'
        }}
      />
    </div>
  )
}