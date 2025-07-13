
import React from 'react'
import GameLog from '../game/GameLog'
import CommandInput from '../game/CommandInput'
import { GameLogEntry } from '../shared/types'

interface LeftSidebarProps {
  gameLog: GameLogEntry[]
  onCommand: (command: string) => void
  onQuickAction: (action: string) => void
}

export default function LeftSidebar({
  gameLog,
  onCommand,
  onQuickAction
}: LeftSidebarProps) {
  return (
    <aside className="w-96 bg-sidebar border-r border-sidebar-border flex flex-col h-full">
      {/* Game Log */}
      <div className="flex-1 overflow-hidden">
        <GameLog entries={gameLog} />
      </div>

      {/* Command Input */}
      <div className="border-t border-sidebar-border">
        <CommandInput onSubmit={onCommand} onQuickAction={onQuickAction} />
      </div>
    </aside>
  )
}