
import React from 'react'
import SelectionInfo from '../game/SelectionInfo'
import GameLog from '../game/GameLog'
import CommandInput from '../game/CommandInput'
import { Board } from '@/models/board.models'
import { GameLogEntry } from '../shared/types'

interface LeftSidebarProps {
  board: Board | null
  selectedHex: number | null
  selectedVertex: string | null
  selectedEdge: string | null
  gameLog: GameLogEntry[]
  onCommand: (command: string) => void
}

export default function LeftSidebar({
  board,
  selectedHex,
  selectedVertex,
  selectedEdge,
  gameLog,
  onCommand
}: LeftSidebarProps) {
  return (
    <aside className="w-96 bg-sidebar border-r border-sidebar-border flex flex-col h-full">
      {/* Selection Info */}
      <div className="border-b border-sidebar-border">
        <SelectionInfo
          board={board}
          selectedHex={selectedHex}
          selectedVertex={selectedVertex}
          selectedEdge={selectedEdge}
        />
      </div>

      {/* Game Log */}
      <div className="flex-1 overflow-hidden">
        <GameLog entries={gameLog} />
      </div>

      {/* Command Input */}
      <div className="border-t border-sidebar-border">
        <CommandInput onSubmit={onCommand} />
      </div>
    </aside>
  )
}