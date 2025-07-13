
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
    <aside className="w-96 bg-white border-r-2 border-gray-300 flex flex-col h-full">
      {/* Selection Info */}
      <div className="border-b border-gray-200">
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
      <div className="border-t border-gray-200">
        <CommandInput onSubmit={onCommand} />
      </div>
    </aside>
  )
}