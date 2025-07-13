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
      4: { [Resource.Wood]: 0, [Resource.Brick]: 1, [Resource.Sheep]: 1, [Resource.Wheat]: 0, [Resource.Ore]: 0 },
      5: { [Resource.Wood]: 2, [Resource.Brick]: 2, [Resource.Sheep]: 2, [Resource.Wheat]: 1, [Resource.Ore]: 1 },
      6: { [Resource.Wood]: 1, [Resource.Brick]: 2, [Resource.Sheep]: 3, [Resource.Wheat]: 0, [Resource.Ore]: 1 },
      7: { [Resource.Wood]: 3, [Resource.Brick]: 1, [Resource.Sheep]: 1, [Resource.Wheat]: 2, [Resource.Ore]: 0 },
      8: { [Resource.Wood]: 0, [Resource.Brick]: 3, [Resource.Sheep]: 2, [Resource.Wheat]: 1, [Resource.Ore]: 1 }
    },
    playerSOL: { 1: 1000, 2: 1000, 3: 1000, 4: 1000, 5: 1000, 6: 1000, 7: 1000, 8: 1000 }
  })

  // UI state
  const [selectedHex, setSelectedHex] = useState<number | null>(null)
  const [selectedVertex, setSelectedVertex] = useState<string | null>(null)
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null)
  const [viewOptions, setViewOptions] = useState<ViewOptions>({
    showVertices: true,
    showHexNumbers: false,
    showPortable: true,
    boardSize: 2
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
    if (!board) return
    
    switch (action) {
      case 'build-settlement':
        if (selectedVertex && !board.buildings.has(selectedVertex)) {
          const newBoard = { ...board }
          newBoard.buildings.set(selectedVertex, {
            type: BuildingType.Settlement,
            player: gameState.currentPlayer,
            vertexId: selectedVertex
          })
          setBoard(newBoard)
          addLogEntry(`Player ${gameState.currentPlayer} built a settlement`, 'action')
        } else {
          addLogEntry('Select an empty vertex to build a settlement', 'system')
        }
        break
      
      case 'build-city':
        if (selectedVertex && board.buildings.has(selectedVertex)) {
          const building = board.buildings.get(selectedVertex)!
          if (building.type === BuildingType.Settlement && building.player === gameState.currentPlayer) {
            const newBoard = { ...board }
            newBoard.buildings.set(selectedVertex, {
              type: BuildingType.City,
              player: gameState.currentPlayer,
              vertexId: selectedVertex
            })
            setBoard(newBoard)
            addLogEntry(`Player ${gameState.currentPlayer} upgraded to a city`, 'action')
          } else {
            addLogEntry('Select your own settlement to upgrade to a city', 'system')
          }
        } else {
          addLogEntry('Select a settlement to upgrade to a city', 'system')
        }
        break
      
      case 'build-road':
        if (selectedEdge && !board.roads.has(selectedEdge)) {
          const newBoard = { ...board }
          newBoard.roads.set(selectedEdge, gameState.currentPlayer)
          setBoard(newBoard)
          addLogEntry(`Player ${gameState.currentPlayer} built a road`, 'action')
        } else {
          addLogEntry('Select an empty edge to build a road', 'system')
        }
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
    const newBoard = initializeBoard(size)
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
          currentPlayer={gameState.currentPlayer}
        />

        {/* Main Board Area */}
        <div className="flex-1 flex flex-col bg-muted min-w-[800px]">
          <div className="flex-1 overflow-hidden flex items-center justify-center">
            <BoardSVG
              board={board}
              selectedHex={selectedHex}
              selectedVertex={selectedVertex}
              selectedEdge={selectedEdge}
              viewOptions={viewOptions}
              onHexClick={(hexIndex) => {
                setSelectedHex(hexIndex)
                if (hexIndex !== null) {
                  setSelectedVertex(null)
                  setSelectedEdge(null)
                }
              }}
              onVertexClick={(vertexId) => {
                setSelectedVertex(vertexId)
                if (vertexId !== null) {
                  setSelectedHex(null)
                  setSelectedEdge(null)
                }
              }}
              onEdgeClick={(edgeId) => {
                setSelectedEdge(edgeId)
                if (edgeId !== null) {
                  setSelectedHex(null)
                  setSelectedVertex(null)
                }
              }}
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
          board={board}
        />
      </div>
    </div>
  )
}

export default App