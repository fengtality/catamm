
import GameLog from '../game/GameLog'
import { GameLogEntry } from '../shared/types'

interface LeftSidebarProps {
  gameLog: GameLogEntry[]
  onCommand: (command: string) => void
  currentPlayer?: number
}

export default function LeftSidebar({
  gameLog,
  onCommand,
  currentPlayer
}: LeftSidebarProps) {
  return (
    <aside className="w-full h-full bg-sidebar border-r border-sidebar-border flex flex-col overflow-hidden">
      {/* Game Log with integrated chat input */}
      <GameLog entries={gameLog} onCommand={onCommand} currentPlayer={currentPlayer} />
    </aside>
  )
}