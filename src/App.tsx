import React, { useState, useRef, useCallback } from 'react'
import Header from './components/layout/Header'
import LeftSidebar from './components/layout/LeftSidebar'
import RightSidebar from './components/layout/RightSidebar'
import BoardSVG from './components/board/BoardSVG'
import SelectionInfo from './components/game/SelectionInfo'
import { Board, BuildingType } from '@/models/board.models'
import { initializeBoard } from '@/models/board.initialization'
import { Resource, BUILDING_COSTS } from '@/types'
import { GameLogEntry, ViewOptions, GameState } from './components/shared/types'
import { DevCardType, DevCard, DEV_CARD_COST, drawRandomDevCard, canPlayDevCard } from '@/types/development-cards'
import { useTheme } from './hooks/useTheme'
import { getPortableVertices } from '@/models/board.initialization'
import { getMarketForPortableVertex, createMarket } from '@/utils/market-utils'
import { AMMPool } from '@/types/game.types'

// Game configuration
const NUM_PLAYERS = 4 // Change this to set the number of players

// Game constants
const GAME_CONSTANTS = {
  DICE_ROLL_DELAY: 500,
  SETUP_COMPLETE_DELAY: 1000,
  MAX_PLACEMENT_ATTEMPTS: 100,
  MIN_DICE_VALUE: 2,
  MAX_DICE_VALUE: 12,
  ROBBER_ROLL: 7
} as const

function App() {
  // Theme
  const { darkMode, toggleDarkMode } = useTheme()
  
  // UI state
  const [leftSidebarVisible, setLeftSidebarVisible] = useState(true)
  
  // Game state
  const [board, setBoard] = useState<Board | null>(null)
  const [setupRound, setSetupRound] = useState(1) // Track setup round (1 or 2)
  const [setupBuildings, setSetupBuildings] = useState(0) // Track buildings placed by current player
  
  // Helper to create empty resource set
  const createEmptyResourceSet = (): Record<Resource, number> => ({
    [Resource.Wood]: 0,
    [Resource.Brick]: 0,
    [Resource.Sheep]: 0,
    [Resource.Wheat]: 0,
    [Resource.Ore]: 0
  })

  // Initialize player data based on NUM_PLAYERS
  const initializePlayerData = () => {
    const playerResources: Record<number, Record<string, number>> = {}
    const playerSOL: Record<number, number> = {}
    const playerDevCards: Record<number, DevCard[]> = {}
    const knightsPlayed: Record<number, number> = {}
    
    for (let i = 1; i <= NUM_PLAYERS; i++) {
      playerResources[i] = createEmptyResourceSet()
      playerSOL[i] = 1000
      playerDevCards[i] = []
      knightsPlayed[i] = 0
    }
    
    return { playerResources, playerSOL, playerDevCards, knightsPlayed }
  }
  
  const initialData = initializePlayerData()
  
  const [gameState, setGameState] = useState<GameState>({
    currentPlayer: 1,
    turn: 1,
    phase: 'setup',
    playerResources: initialData.playerResources,
    playerSOL: initialData.playerSOL,
    playerDevCards: initialData.playerDevCards,
    knightsPlayed: initialData.knightsPlayed
  })

  // UI state
  const [selectedHex, setSelectedHex] = useState<number | null>(null)
  const [selectedVertex, setSelectedVertex] = useState<string | null>(null)
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null)
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [isMovingRobber, setIsMovingRobber] = useState(false)
  const [activeMarkets, setActiveMarkets] = useState<Map<string, AMMPool>>(new Map())
  const [viewOptions, setViewOptions] = useState<ViewOptions>({
    showVertices: true,
    showHexNumbers: false,
    showPortable: true,
    boardSize: 2
  })
  const [gameLog, setGameLog] = useState<GameLogEntry[]>([])
  const logIdRef = useRef(0)

  const addLogEntry = useCallback((message: string, type: GameLogEntry['type'] = 'action') => {
    setGameLog(prev => [...prev, {
      id: logIdRef.current++,
      timestamp: new Date(),
      message,
      type
    }])
  }, [])

  const handleNewBoard = useCallback((boardSize?: number) => {
    const size = boardSize ?? viewOptions.boardSize
    const newBoard = initializeBoard(size)
    setBoard(newBoard)
    addLogEntry(`New board generated with ${newBoard.hexes.length} hexes`, 'system')
    addLogEntry(`Setup Phase: ${NUM_PLAYERS} players, each places 2 settlements and 2 roads`, 'system')
    addLogEntry(`Player 1's turn - Setup Round 1`, 'system')
  }, [viewOptions.boardSize, addLogEntry])

  // Initialize board on mount
  React.useEffect(() => {
    handleNewBoard()
  }, [handleNewBoard])

  // Distribute resources based on dice roll
  const distributeResources = (roll: number) => {
    if (!board) return

    const newPlayerResources = { ...gameState.playerResources }
    const hexesHit: number[] = []
    const distributions: { hexIndex: number, vertexId: string, player: number, resource: string, amount: number }[] = []
    
    // Find all hexes with the rolled number
    board.hexes.forEach((hex, hexIndex) => {
      if (hex.numberToken === roll && !hex.hasRobber && hex.resource) {
        hexesHit.push(hexIndex)
        
        // Find all buildings adjacent to this hex
        board.globalVertices.forEach((vertex, vertexId) => {
          const building = board.buildings.get(vertexId)
          if (building && vertex.hexes.some(vh => vh.hexIndex === hexIndex)) {
            const resourceAmount = building.type === BuildingType.City ? 2 : 1
            const player = building.player
            
            if (!newPlayerResources[player]) {
              newPlayerResources[player] = createEmptyResourceSet()
            }
            
            if (hex.resource) {
              newPlayerResources[player][hex.resource] = 
                (newPlayerResources[player][hex.resource] || 0) + resourceAmount
            }
            
            distributions.push({
              hexIndex,
              vertexId,
              player,
              resource: hex.resource as string,
              amount: resourceAmount
            })
          }
        })
      }
    })
    
    // Log results
    if (hexesHit.length > 0) {
      addLogEntry(`Hexes activated: ${hexesHit.join(', ')}`, 'system')
      distributions.forEach(dist => {
        addLogEntry(
          `  → Hex ${dist.hexIndex} (${dist.resource}): Player ${dist.player} at vertex ${dist.vertexId} receives ${dist.amount} ${dist.resource}`, 
          'system'
        )
      })
    } else {
      addLogEntry(`No hexes with number ${roll} (or all blocked by robber)`, 'system')
    }
    
    setGameState(prev => ({
      ...prev,
      playerResources: newPlayerResources
    }))
  }

  // Check if player has enough resources for a purchase
  const hasResourcesFor = (purchaseType: 'Settlement' | 'City' | 'Road' | 'DevCard', player: number = gameState.currentPlayer): boolean => {
    const playerResources = gameState.playerResources[player]
    if (!playerResources) return false
    const costs = purchaseType === 'DevCard' ? DEV_CARD_COST : BUILDING_COSTS[purchaseType]
    
    return Object.entries(costs).every(([resource, cost]) => 
      (playerResources[resource as Resource] || 0) >= cost
    )
  }

  // Deduct resources for purchase
  const deductResourcesFor = (purchaseType: 'Settlement' | 'City' | 'Road' | 'DevCard', player: number = gameState.currentPlayer) => {
    const costs = purchaseType === 'DevCard' ? DEV_CARD_COST : BUILDING_COSTS[purchaseType]
    const newPlayerResources = { ...gameState.playerResources }
    
    if (!newPlayerResources[player]) {
      newPlayerResources[player] = createEmptyResourceSet()
    }
    
    const playerResources = newPlayerResources[player]
    if (playerResources) {
      Object.entries(costs).forEach(([resource, cost]) => {
        const res = resource as Resource
        if (playerResources[res] !== undefined) {
          playerResources[res] -= cost
        }
      })
    }
    
    setGameState(prev => ({
      ...prev,
      playerResources: newPlayerResources
    }))
  }

  // Get next player in setup phase
  const getNextSetupPlayer = () => {
    if (setupRound === 1) {
      // First round: 1 -> 2 -> 3 -> ... -> NUM_PLAYERS
      if (gameState.currentPlayer < NUM_PLAYERS) {
        return gameState.currentPlayer + 1
      } else {
        // Move to round 2, last player goes again
        setSetupRound(2)
        return NUM_PLAYERS
      }
    } else {
      // Second round: NUM_PLAYERS -> ... -> 3 -> 2 -> 1
      if (gameState.currentPlayer > 1) {
        return gameState.currentPlayer - 1
      } else {
        // Setup complete, move to main game
        return 1
      }
    }
  }

  // Auto-roll dice for a player
  const autoRollDice = (player: number, delay: number = GAME_CONSTANTS.DICE_ROLL_DELAY) => {
    setTimeout(() => {
      const roll = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1
      addLogEntry(`Player ${player} rolled: ${roll}`, 'action')
      if (roll === GAME_CONSTANTS.ROBBER_ROLL) {
        setIsMovingRobber(true)
        addLogEntry('Move the robber to a new hex', 'system')
      } else {
        distributeResources(roll)
      }
    }, delay)
  }

  const handleCommand = (command: string) => {
    addLogEntry(`> ${command}`, 'command')
    // Process command logic here
    const parts = command.toLowerCase().split(' ')
    const cmd = parts[0]
    
    switch (cmd) {
      case 'help':
        addLogEntry('Available commands: build settlement/city, roll [number], trade, end', 'system')
        addLogEntry('Example: "roll 7" to test robber movement', 'system')
        break
      case 'roll': {
        if (gameState.phase === 'setup') {
          addLogEntry('Cannot roll dice during setup phase', 'system')
          break
        }
        let roll: number
        if (parts[1] && !isNaN(parseInt(parts[1]))) {
          // Allow testing with specific roll value
          roll = parseInt(parts[1])
          if (roll < 2 || roll > 12) {
            addLogEntry('Roll value must be between 2 and 12', 'system')
            break
          }
        } else {
          // Random roll
          roll = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1
        }
        addLogEntry(`Player ${gameState.currentPlayer} rolled: ${roll}`, 'action')
        if (roll === 7) {
          setIsMovingRobber(true)
          addLogEntry('Move the robber to a new hex', 'system')
        } else {
          // Distribute resources for the roll
          distributeResources(roll)
        }
        break
      }
      case 'end': {
        if (gameState.phase === 'setup') {
          addLogEntry('Cannot end turn during setup phase', 'system')
          break
        }
        addLogEntry(`Player ${gameState.currentPlayer} ended turn`, 'action')
        const nextPlayer = gameState.currentPlayer === NUM_PLAYERS ? 1 : gameState.currentPlayer + 1
        const nextTurn = gameState.currentPlayer === NUM_PLAYERS ? gameState.turn + 1 : gameState.turn
        setGameState(prev => ({
          ...prev,
          currentPlayer: nextPlayer,
          turn: nextTurn
        }))
        addLogEntry(`Player ${nextPlayer}'s turn - Turn ${nextTurn}`, 'system')
        
        // Auto-roll dice for the next player
        autoRollDice(nextPlayer)
        break
      }
      default:
        addLogEntry(`Unknown command: ${cmd}`, 'system')
    }
  }

  const handleQuickAction = (action: string) => {
    if (!board) return
    
    switch (action) {
      case 'build-settlement':
        if (selectedVertex && !board.buildings.has(selectedVertex)) {
          // Check resources during regular gameplay
          if (gameState.phase === 'play' && !hasResourcesFor('Settlement')) {
            addLogEntry('Not enough resources! Need: 1 Wood, 1 Brick, 1 Sheep, 1 Wheat', 'system')
            break
          }
          
          const newBoard = { ...board }
          newBoard.buildings.set(selectedVertex, {
            type: BuildingType.Settlement,
            player: gameState.currentPlayer,
            vertexId: selectedVertex
          })
          setBoard(newBoard)
          addLogEntry(`Player ${gameState.currentPlayer} built a settlement`, 'action')
          
          // Deduct resources during regular gameplay
          if (gameState.phase === 'play') {
            deductResourcesFor('Settlement')
          }
          
          // During setup phase, handle resource distribution and turn tracking
          if (gameState.phase === 'setup') {
            // On second setup round, give resources for the settlement
            if (setupRound === 2) {
              const newPlayerResources = { ...gameState.playerResources }
              const vertex = board.globalVertices.get(selectedVertex)
              if (vertex) {
                vertex.hexes.forEach(vh => {
                  const hex = board.hexes[vh.hexIndex]
                  if (hex && hex.resource && !hex.hasRobber) {
                    if (!newPlayerResources[gameState.currentPlayer]) {
                      newPlayerResources[gameState.currentPlayer] = createEmptyResourceSet()
                    }
                    const playerResources = newPlayerResources[gameState.currentPlayer]
                    if (playerResources) {
                      playerResources[hex.resource] = (playerResources[hex.resource] || 0) + 1
                    }
                    addLogEntry(`Player ${gameState.currentPlayer} receives 1 ${hex.resource}`, 'system')
                  }
                })
                setGameState(prev => ({
                  ...prev,
                  playerResources: newPlayerResources
                }))
              }
            }
            
            // Track buildings placed
            setSetupBuildings(prev => prev + 1)
          }
          
          // Check if this is a portable vertex and activate the market
          const portableVertices = new Set(getPortableVertices(board))
          if (portableVertices.has(selectedVertex)) {
            const vertex = board.globalVertices.get(selectedVertex)
            if (vertex) {
              const { market, resources } = getMarketForPortableVertex(vertex, board)
              if (market && resources) {
                // Create a new market at this vertex (bonus - no cost to player)
                const newMarket = createMarket(
                  selectedVertex,
                  resources[0],
                  resources[1],
                  gameState.currentPlayer
                )
                
                setActiveMarkets(prev => {
                  const newMap = new Map(prev)
                  newMap.set(selectedVertex, newMarket)
                  return newMap
                })
                
                // Mark the adjacent hexes as used in ports
                newBoard.portsAtVertices.add(selectedVertex)
                vertex.hexes.forEach(vh => {
                  newBoard.hexesUsedInPorts.add(vh.hexIndex)
                })
                
                addLogEntry(`Activated ${resources[0]}-${resources[1]} market at this port! (Bonus: 1 ${resources[0]} and 1 ${resources[1]} added to pool)`, 'system')
              } else {
                addLogEntry('Port created but no valid market (same resources)', 'system')
              }
            }
          }
        } else {
          addLogEntry('Select an empty vertex to build a settlement', 'system')
        }
        break
      
      case 'build-city':
        if (selectedVertex && board.buildings.has(selectedVertex)) {
          const building = board.buildings.get(selectedVertex)
          if (building && building.type === BuildingType.Settlement && building.player === gameState.currentPlayer) {
            // Check resources
            if (!hasResourcesFor('City')) {
              addLogEntry('Not enough resources! Need: 2 Wheat, 3 Ore', 'system')
              break
            }
            
            const newBoard = { ...board }
            newBoard.buildings.set(selectedVertex, {
              type: BuildingType.City,
              player: gameState.currentPlayer,
              vertexId: selectedVertex
            })
            setBoard(newBoard)
            addLogEntry(`Player ${gameState.currentPlayer} upgraded to a city`, 'action')
            
            // Deduct resources
            deductResourcesFor('City')
          } else {
            addLogEntry('Select your own settlement to upgrade to a city', 'system')
          }
        } else {
          addLogEntry('Select a settlement to upgrade to a city', 'system')
        }
        break
      
      case 'build-road':
        if (selectedEdge && !board.roads.has(selectedEdge)) {
          // Check if road is connected to player's settlement/city
          const edge = board.globalEdges.get(selectedEdge)
          if (edge) {
            const hasAdjacentBuilding = edge.vertices.some(vertexId => {
              const building = board.buildings.get(vertexId)
              return building && building.player === gameState.currentPlayer
            })
            
            if (!hasAdjacentBuilding) {
              addLogEntry('Roads must be connected to your settlements or cities', 'system')
              break
            }
          }
          
          // Check resources during regular gameplay
          if (gameState.phase === 'play' && !hasResourcesFor('Road')) {
            addLogEntry('Not enough resources! Need: 1 Wood, 1 Brick', 'system')
            break
          }
          
          const newBoard = { ...board }
          newBoard.roads.set(selectedEdge, gameState.currentPlayer)
          setBoard(newBoard)
          addLogEntry(`Player ${gameState.currentPlayer} built a road`, 'action')
          
          // Deduct resources during regular gameplay
          if (gameState.phase === 'play') {
            deductResourcesFor('Road')
          }
          
          // During setup phase, check if we should advance turn
          if (gameState.phase === 'setup' && setupBuildings >= 1) {
            const nextPlayer = getNextSetupPlayer()
            const isSetupComplete = setupRound === 2 && nextPlayer === 1
            
            setGameState(prev => ({
              ...prev,
              currentPlayer: nextPlayer,
              phase: isSetupComplete ? 'play' : 'setup'
            }))
            setSetupBuildings(0)
            
            // Log turn transition
            if (isSetupComplete) {
              addLogEntry('Setup phase complete! Starting main game.', 'system')
              addLogEntry(`Player ${nextPlayer}'s turn - Turn 1`, 'system')
              
              // Auto-roll dice for first turn of main game
              autoRollDice(nextPlayer, 1000) // Slightly longer delay when transitioning to main game
            } else {
              addLogEntry(`Player ${nextPlayer}'s turn - Setup Round ${setupRound}`, 'system')
            }
          }
        } else {
          addLogEntry('Select an empty edge to build a road', 'system')
        }
        break
      
      case 'trade':
        addLogEntry('Opening trade interface...', 'action')
        // Clear vertex selection to show general trade interface
        setSelectedVertex(null)
        setSelectedResource(null)
        break
      
      case 'end-turn':
        handleCommand('end')
        break
      
      case 'buy-dev-card':
        handleBuyDevCard()
        break
        
      case 'use-dev-card':
        handleUseDevCard()
        break
    }
  }
  
  const handleBuyDevCard = () => {
    const player = gameState.currentPlayer
    
    // Check if player has required resources
    if (!hasResourcesFor('DevCard')) {
      addLogEntry('Not enough resources! Need 1 Ore, 1 Wheat, 1 Sheep', 'system')
      return
    }
    
    // Draw a random card based on probabilities
    const drawnCardType = drawRandomDevCard()
    const newCard: DevCard = {
      id: `${player}-${gameState.turn}-${Date.now()}`,
      type: drawnCardType,
      purchasedTurn: gameState.turn
    }
    
    // Update game state - add the card
    setGameState(prev => ({
      ...prev,
      playerDevCards: {
        ...prev.playerDevCards,
        [player]: [...(prev.playerDevCards[player] || []), newCard]
      }
    }))
    
    // Deduct resources
    deductResourcesFor('DevCard')
    
    // Don't reveal what card was drawn
    addLogEntry(`Player ${player} bought a development card`, 'action')
  }

  const handleUseDevCard = () => {
    const player = gameState.currentPlayer
    const playerCards = gameState.playerDevCards[player] || []
    
    // Get playable cards
    const playableCards = playerCards.filter(card => 
      canPlayDevCard(card, gameState.turn)
    )
    
    if (playableCards.length === 0) {
      addLogEntry('No development cards can be played this turn', 'system')
      return
    }
    
    // Randomly select a playable card
    const randomIndex = Math.floor(Math.random() * playableCards.length)
    const selectedCard = playableCards[randomIndex]
    
    if (!selectedCard) {
      addLogEntry('Failed to select development card', 'system')
      return
    }
    
    // Log what card is being played
    addLogEntry(`Player ${player} plays ${selectedCard.type} card`, 'action')
    
    // Apply card effects
    switch (selectedCard.type) {
      case DevCardType.Knight: {
        // Update knights played count
        setGameState(prev => ({
          ...prev,
          knightsPlayed: {
            ...prev.knightsPlayed,
            [player]: (prev.knightsPlayed[player] || 0) + 1
          }
        }))
        
        // Start robber movement
        setIsMovingRobber(true)
        addLogEntry('Move the robber to a new hex', 'system')
        break
      }
        
      case DevCardType.YearOfPlenty: {
        // Give player 2 random resources
        const resources = [Resource.Wood, Resource.Brick, Resource.Sheep, Resource.Wheat, Resource.Ore]
        const resource1 = resources[Math.floor(Math.random() * resources.length)]
        const resource2 = resources[Math.floor(Math.random() * resources.length)]
        
        setGameState(prev => ({
          ...prev,
          playerResources: {
            ...prev.playerResources,
            [player]: (() => {
              const currentResources = prev.playerResources[player] || createEmptyResourceSet()
              return {
                ...currentResources,
                [resource1 as Resource]: (currentResources[resource1 as Resource] || 0) + 1,
                [resource2 as Resource]: (currentResources[resource2 as Resource] || 0) + 1
              }
            })()
          }
        }))
        
        addLogEntry(`Player ${player} receives 1 ${resource1} and 1 ${resource2}`, 'system')
        break
      }
        
      case DevCardType.RoadBuilding: {
        // For now, just give resources to build 2 roads
        setGameState(prev => ({
          ...prev,
          playerResources: {
            ...prev.playerResources,
            [player]: (() => {
              const currentResources = prev.playerResources[player] || createEmptyResourceSet()
              return {
                ...currentResources,
                [Resource.Wood]: (currentResources[Resource.Wood as Resource] || 0) + 2,
                [Resource.Brick]: (currentResources[Resource.Brick as Resource] || 0) + 2
              }
            })()
          }
        }))
        
        addLogEntry('Player receives resources to build 2 roads (2 Wood, 2 Brick)', 'system')
        break
      }
        
      case DevCardType.Monopoly: {
        // Pick a random resource and take all of that resource from other players
        const allResources = [Resource.Wood, Resource.Brick, Resource.Sheep, Resource.Wheat, Resource.Ore]
        const monopolyResource = allResources[Math.floor(Math.random() * allResources.length)]
        if (!monopolyResource) break
        
        let totalCollected = 0
        const newPlayerResources = { ...gameState.playerResources }
        
        for (let i = 1; i <= NUM_PLAYERS; i++) {
          if (i !== player && newPlayerResources[i]) {
            const playerRes = newPlayerResources[i]
            if (playerRes) {
              const amount = playerRes[monopolyResource] || 0
              totalCollected += amount
              playerRes[monopolyResource] = 0
            }
          }
        }
        
        if (!newPlayerResources[player]) {
          newPlayerResources[player] = createEmptyResourceSet()
        }
        newPlayerResources[player][monopolyResource] = 
          (newPlayerResources[player][monopolyResource] || 0) + totalCollected
        
        setGameState(prev => ({
          ...prev,
          playerResources: newPlayerResources
        }))
        
        addLogEntry(`Player ${player} monopolizes ${monopolyResource}, collecting ${totalCollected} total`, 'system')
        break
      }
        
      case DevCardType.VictoryPoint: {
        // Victory points are just revealed, not "played"
        addLogEntry(`Player ${player} reveals a Victory Point card!`, 'system')
        break
      }
    }
    
    // Mark card as played (remove from hand)
    setGameState(prev => ({
      ...prev,
      playerDevCards: {
        ...prev.playerDevCards,
        [player]: (prev.playerDevCards[player] || []).filter(card => card.id !== selectedCard.id)
      }
    }))
  }

  const handleCenterView = () => {
    // This would be implemented in BoardCanvas
    addLogEntry('View centered', 'system')
  }

  const handleSkipSetup = () => {
    if (!board || gameState.phase !== 'setup') return
    
    addLogEntry('Skipping setup phase...', 'system')
    
    const newBoard = { ...board }
    const newPlayerResources = { ...gameState.playerResources }
    const newMarkets = new Map(activeMarkets)
    
    // Get all available vertices
    const availableVertices = Array.from(board.globalVertices.keys())
    
    // For each player, place 2 settlements and 2 roads
    for (let player = 1; player <= NUM_PLAYERS; player++) {
      for (let i = 0; i < 2; i++) {
        // Find a random available vertex
        let vertexId: string | null = null
        let attempts = 0
        while (!vertexId && attempts < 100) {
          const randomIndex = Math.floor(Math.random() * availableVertices.length)
          const candidateVertex = availableVertices[randomIndex]
          
          // Check if vertex is available (no building on it)
          if (candidateVertex && !newBoard.buildings.has(candidateVertex)) {
            // Check distance rule (no adjacent vertices have buildings)
            const adjacentEdges = Array.from(board.globalEdges.values())
              .filter(edge => candidateVertex && edge.vertices.includes(candidateVertex))
            
            let validPlacement = true
            for (const edge of adjacentEdges) {
              const otherVertex = edge.vertices.find(v => v !== candidateVertex)
              if (otherVertex !== undefined && newBoard.buildings.has(otherVertex)) {
                validPlacement = false
                break
              }
            }
            
            if (validPlacement) {
              vertexId = candidateVertex
            }
          }
          attempts++
        }
        
        if (vertexId) {
          // Place settlement
          if (vertexId) {
            newBoard.buildings.set(vertexId, {
            type: BuildingType.Settlement,
            player: player,
            vertexId: vertexId
          })
          
          // Check if this is a portable vertex and activate the market
          const portableVertices = new Set(getPortableVertices(board))
          if (portableVertices.has(vertexId)) {
            const vertex = board.globalVertices.get(vertexId)
            if (vertex) {
              const { market, resources } = getMarketForPortableVertex(vertex, board)
            if (market && resources) {
              // Create a new market at this vertex
              const newMarket = createMarket(
                vertexId,
                resources[0],
                resources[1],
                player
              )
              
              newMarkets.set(vertexId, newMarket)
              
              // Mark the adjacent hexes as used in ports
              newBoard.portsAtVertices.add(vertexId)
              vertex.hexes.forEach(vh => {
                newBoard.hexesUsedInPorts.add(vh.hexIndex)
              })
              
              addLogEntry(`Player ${player} activated ${resources[0]}-${resources[1]} market at port`, 'system')
            }
          }
          }
          
          // Give resources for the second settlement
          if (i === 1) {
            const vertex = board.globalVertices.get(vertexId)
            if (vertex) {
              vertex.hexes.forEach(vh => {
                const hex = board.hexes[vh.hexIndex]
                if (hex && hex.resource && !hex.hasRobber) {
                  if (!newPlayerResources[player]) {
                    newPlayerResources[player] = createEmptyResourceSet()
                  }
                  const playerRes = newPlayerResources[player]
                  if (playerRes) {
                    playerRes[hex.resource] = (playerRes[hex.resource] || 0) + 1
                  }
                }
              })
          }
          }
          
          // Place a road adjacent to this settlement
          const adjacentEdges = Array.from(board.globalEdges.values())
            .filter(edge => edge.vertices.includes(vertexId) && !newBoard.roads.has(edge.id))
          
          if (adjacentEdges.length > 0) {
            const randomEdge = adjacentEdges[Math.floor(Math.random() * adjacentEdges.length)]
            if (randomEdge) {
              newBoard.roads.set(randomEdge.id, player)
            }
          }
          }
        }
      }
    }
    
    // Update game state
    setBoard(newBoard)
    setActiveMarkets(newMarkets)
    setGameState(prev => ({
      ...prev,
      phase: 'play',
      turn: 1,
      currentPlayer: 1,
      playerResources: newPlayerResources
    }))
    setSetupRound(1)
    setSetupBuildings(0)
    
    addLogEntry('Setup complete! Starting main game.', 'system')
    addLogEntry(`Player 1's turn - Turn 1`, 'system')
    
    // Auto-roll dice for first turn
    autoRollDice(1, 1000)
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
        onSkipSetup={handleSkipSetup}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-x-auto overflow-y-hidden relative">
        {/* Left Sidebar */}
        {leftSidebarVisible && (
          <LeftSidebar
            gameLog={gameLog}
            onCommand={handleCommand}
            currentPlayer={gameState.currentPlayer}
          />
        )}
        {/* Toggle Button */}
        <button
          onClick={() => setLeftSidebarVisible(!leftSidebarVisible)}
          className="absolute top-4 z-10 bg-sidebar border border-sidebar-border rounded-r-md p-2 hover:bg-sidebar-accent transition-colors"
          style={{ left: leftSidebarVisible ? '384px' : '0' }}
        >
          <svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d={leftSidebarVisible ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
            />
          </svg>
        </button>

        {/* Main Board Area */}
        <div className="flex-1 flex flex-col bg-muted min-w-[800px]">
          <div className="flex-1 overflow-hidden flex items-center justify-center">
            <BoardSVG
              board={board}
              selectedHex={selectedHex}
              selectedVertex={selectedVertex}
              selectedEdge={selectedEdge}
              viewOptions={viewOptions}
              isMovingRobber={isMovingRobber}
              gamePhase={gameState.phase}
              setupBuildings={setupBuildings}
              currentPlayer={gameState.currentPlayer}
              onHexClick={(hexIndex) => {
                if (isMovingRobber && hexIndex !== null) {
                  // Handle robber placement
                  setSelectedHex(hexIndex)
                  setIsMovingRobber(false)
                  
                  // Update board state with new robber position
                  if (board) {
                    const newBoard = { ...board }
                    // Remove robber from all hexes
                    newBoard.hexes = newBoard.hexes.map(h => ({ ...h, hasRobber: false }))
                    // Place robber on selected hex
                    const hex = newBoard.hexes[hexIndex]
                    if (hex) {
                      newBoard.hexes[hexIndex] = { ...hex, hasRobber: true }
                    }
                    setBoard(newBoard)
                  }
                  
                  addLogEntry(`Robber moved to hex ${hexIndex}`, 'action')
                } else if (isMovingRobber) {
                  setSelectedHex(hexIndex)
                }
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
                  setSelectedResource(null)
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
          selectedVertex={selectedVertex}
          selectedResource={selectedResource}
          onResourceSelect={setSelectedResource}
          activeMarkets={activeMarkets}
          onVertexDeselect={() => setSelectedVertex(null)}
          onVertexSelect={setSelectedVertex}
          numPlayers={NUM_PLAYERS}
          onQuickAction={handleQuickAction}
          currentTurn={gameState.turn}
          playerDevCards={Object.values(gameState.playerDevCards[gameState.currentPlayer] || []).length}
          playerDevCardsArray={gameState.playerDevCards[gameState.currentPlayer]}
          setupRound={setupRound}
          setupBuildings={setupBuildings}
          hasResourcesFor={(type) => hasResourcesFor(type, gameState.currentPlayer)}
        />
      </div>
    </div>
  )
}

export default App