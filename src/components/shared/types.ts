export interface GameLogEntry {
  id: number
  timestamp: Date
  message: string
  type: 'action' | 'discovery' | 'system' | 'command'
}

export interface ViewOptions {
  showVertices: boolean
  showHexNumbers: boolean
  showPortable: boolean
  boardSize: number
}

export interface GameState {
  currentPlayer: number
  turn: number
  phase: 'setup' | 'play' | 'end'
  playerResources: Record<number, Record<string, number>>
  playerSOL: Record<number, number>
}