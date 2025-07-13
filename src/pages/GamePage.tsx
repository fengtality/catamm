import React, { useState, useRef } from 'react'
import Header from '../components/layout/Header'
import LeftSidebar from '../components/layout/LeftSidebar'
import RightSidebar from '../components/layout/RightSidebar'
import BoardCanvas from '../components/game/BoardCanvas'
import BoardControls from '../components/game/BoardControls'
import { Board } from '@/models/board.models'
import { initializeBoard } from '@/models/board.initialization'
import { Resource } from '@/types'
import { GameLogEntry, ViewOptions, GameState } from '../components/shared/types'

export default function GamePage() {
  // Game state
  const [board, setBoard] = useState<Board | null>(null)
  const [gameState, setGameState] = useState<GameState>({
    currentPlayer: 1,
    turn: 1,
    phase: 'setup',
    playerResources: {
      1: { [Resource.Wood]: 0, [Resource.Brick]: 0, [Resource.Sheep]: 0, [Resource.Wheat]: 0, [Resource.Ore]: 0 },
      2: { [Resource.Wood]: 0, [Resource.Brick]: 0, [Resource.Sheep]: 0, [Resource.Wheat]: 0, [Resource.Ore]: 0 },
      3: { [Resource.Wood]: 0, [Resource.Brick]: 0, [Resource.Sheep]: 0, [Resource.Wheat]: 0, [Resource.Ore]: 0 },
      4: { [Resource.Wood]: 0, [Resource.Brick]: 0, [Resource.Sheep]: 0, [Resource.Wheat]: 0, [Resource.Ore]: 0 }
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
      case 'build-port':
        addLogEntry('Building AMM port...', 'action')
        break
      case 'trade':
        addLogEntry('Opening trade interface...', 'action')
        break
      case 'end-turn':
        handleCommand('end')
        break
    }
  }

  const handleNewBoard = () => {
    const newBoard = initializeBoard(viewOptions.boardSize, 120, { x: 1000, y: 1000 })
    setBoard(newBoard)
    addLogEntry(`New board generated with ${newBoard.hexes.length} hexes`, 'system')
  }

  const handleCenterView = () => {
    // This would be implemented in BoardCanvas
    addLogEntry('View centered', 'system')
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <Header
        currentPlayer={gameState.currentPlayer}
        turn={gameState.turn}
        phase={gameState.phase}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-x-auto overflow-y-hidden">
        {/* Left Sidebar */}
        <LeftSidebar
          board={board}
          selectedHex={selectedHex}
          selectedVertex={selectedVertex}
          selectedEdge={selectedEdge}
          gameLog={gameLog}
          onCommand={handleCommand}
        />

        {/* Main Board Area */}
        <div className="flex-1 flex flex-col bg-gray-100 min-w-[800px]">
          <div className="flex-1 p-8 overflow-auto flex items-center justify-center">
            <BoardCanvas
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
          <BoardControls
            viewOptions={viewOptions}
            onViewOptionsChange={setViewOptions}
            onNewBoard={handleNewBoard}
            onCenterView={handleCenterView}
          />
        </div>

        {/* Right Sidebar */}
        <RightSidebar
          currentPlayer={gameState.currentPlayer}
          playerResources={gameState.playerResources}
          onQuickAction={handleQuickAction}
        />
      </div>
    </div>
  )
}