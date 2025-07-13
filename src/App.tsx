import React, { useState, useRef } from 'react'
import Header from './components/layout/Header'
import LeftSidebar from './components/layout/LeftSidebar'
import RightSidebar from './components/layout/RightSidebar'
import BoardSVG from './components/board/BoardSVG'
import SelectionInfo from './components/game/SelectionInfo'
import { Board, BuildingType } from '@/models/board.models'
import { initializeBoard } from '@/models/board.initialization'
import { Resource } from '@/types'
import { GameLogEntry, ViewOptions, GameState } from './components/shared/types'
import { useTheme } from './hooks/useTheme'
import './App.css'

function App() {
  // Theme
  const { darkMode, toggleDarkMode } = useTheme()
  
  // Game state
  const [board, setBoard] = useState<Board | null>(null)
  const [gameState, setGameState] = useState<GameState>({
    currentPlayer: 1,
    turn: 1,
    phase: 'setup',
    playerResources: {
      1: { [Resource.Wood]: 3, [Resource.Brick]: 2, [Resource.Sheep]: 4, [Resource.Wheat]: 1, [Resource.Ore]: 0 },
      2: { [Resource.Wood]: 2, [Resource.Brick]: 3, [Resource.Sheep]: 1, [Resource.Wheat]: 2, [Resource.Ore]: 1 },
      3: { [Resource.Wood]: 1, [Resource.Brick]: 1, [Resource.Sheep]: 2, [Resource.Wheat]: 3, [Resource.Ore]: 2 },
      4: { [Resource.Wood]: 0, [Resource.Brick]: 1, [Resource.Sheep]: 1, [Resource.Wheat]: 0, [Resource.Ore]: 0 }
    },
    playerSOL: { 1: 1000, 2: 1000, 3: 1000, 4: 1000 }
  })

  // UI state
  const [selectedHex, setSelectedHex] = useState<number | null>(null)
  const [selectedVertex, setSelectedVertex] = useState<string | null>(null)
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null)
  const [viewOptions, setViewOptions] = useState<ViewOptions>({
    showVertices: true,
    showHexNumbers: true,
    showPortable: true,
    boardSize: 3
  })
  const [gameLog, setGameLog] = useState<GameLogEntry[]>([])
  const logIdRef = useRef(0)

  // Initialize board on mount
  React.useEffect(() => {
    handleNewBoard()
  }, [])

  const addLogEntry = (message: string, type: GameLogEntry['type'] = 'action') => {
    setGameLog(prev => [...prev, {
      id: logIdRef.current++,
      timestamp: new Date(),
      message,
      type
    }])
  }

  const handleCommand = (command: string) => {
    addLogEntry(`> ${command}`, 'command')
    // Process command logic here
    const parts = command.toLowerCase().split(' ')
    const cmd = parts[0]
    
    switch (cmd) {
      case 'help':
        addLogEntry('Available commands: build settlement/city, roll, trade, end', 'system')
        break
      case 'roll':
        const roll = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1
        addLogEntry(`Rolled: ${roll}`, 'action')
        break
      case 'end':
        addLogEntry(`Player ${gameState.currentPlayer} ended turn`, 'action')
        setGameState(prev => ({
          ...prev,
          currentPlayer: (prev.currentPlayer % 4) + 1,
          turn: prev.turn + 1
        }))
        break
      default:
        addLogEntry(`Unknown command: ${cmd}`, 'system')
    }
  }

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'build':
        addLogEntry('Building settlement/city...', 'action')
        break
      case 'trade':
        addLogEntry('Opening trade interface...', 'action')
        break
      case 'end-turn':
        handleCommand('end')
        break
    }
  }

  const handleNewBoard = (boardSize?: number) => {
    const size = boardSize ?? viewOptions.boardSize
    const newBoard = initializeBoard(size, 150, { x: 1500, y: 1500 })
    
    // Add some test buildings and roads
    const vertexIds = Array.from(newBoard.globalVertices.keys())
    const edgeIds = Array.from(newBoard.globalEdges.keys())
    
    // Add a few test settlements
    if (vertexIds.length > 10) {
      newBoard.buildings.set(vertexIds[5], { type: BuildingType.Settlement, player: 1, vertexId: vertexIds[5] })
      newBoard.buildings.set(vertexIds[10], { type: BuildingType.City, player: 2, vertexId: vertexIds[10] })
      newBoard.buildings.set(vertexIds[15], { type: BuildingType.Settlement, player: 3, vertexId: vertexIds[15] })
    }
    
    // Add a few test roads
    if (edgeIds.length > 10) {
      newBoard.roads.set(edgeIds[3], 1)
      newBoard.roads.set(edgeIds[7], 2)
      newBoard.roads.set(edgeIds[12], 3)
    }
    
    setBoard(newBoard)
    addLogEntry(`New board generated with ${newBoard.hexes.length} hexes`, 'system')
  }

  const handleCenterView = () => {
    // This would be implemented in BoardCanvas
    addLogEntry('View centered', 'system')
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <Header
        viewOptions={viewOptions}
        onViewOptionsChange={setViewOptions}
        onNewBoard={handleNewBoard}
        onCenterView={handleCenterView}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-x-auto overflow-y-hidden">
        {/* Left Sidebar */}
        <LeftSidebar
          gameLog={gameLog}
          onCommand={handleCommand}
          onQuickAction={handleQuickAction}
        />

        {/* Main Board Area */}
        <div className="flex-1 flex flex-col bg-muted min-w-[800px]">
          <div className="flex-1 p-8 overflow-auto flex items-center justify-center">
            <BoardSVG
              board={board}
              selectedHex={selectedHex}
              selectedVertex={selectedVertex}
              selectedEdge={selectedEdge}
              viewOptions={viewOptions}
              onHexClick={setSelectedHex}
              onVertexClick={setSelectedVertex}
              onEdgeClick={setSelectedEdge}
            />
          </div>
          <SelectionInfo
            board={board}
            selectedHex={selectedHex}
            selectedVertex={selectedVertex}
            selectedEdge={selectedEdge}
          />
        </div>

        {/* Right Sidebar */}
        <RightSidebar
          gameState={gameState}
          currentPlayer={gameState.currentPlayer}
          playerResources={gameState.playerResources}
        />
      </div>
    </div>
  )
}

export default App