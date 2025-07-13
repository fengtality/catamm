
import React from 'react'
import PlayerInfo from '../player/PlayerInfo'
import AMMMarkets from '../player/AMMMarkets'
import QuickActions from '../player/QuickActions'
import { Resource } from '@/types'

interface RightSidebarProps {
  currentPlayer: number
  playerResources: Record<number, Record<Resource, number>>
  onQuickAction: (action: string) => void
}

export default function RightSidebar({
  currentPlayer,
  playerResources,
  onQuickAction
}: RightSidebarProps) {
  return (
    <aside className="w-80 bg-sidebar border-l border-sidebar-border flex flex-col h-full">
      {/* Player Info */}
      <div className="border-b border-sidebar-border">
        <PlayerInfo
          currentPlayer={currentPlayer}
          resources={playerResources[currentPlayer]}
        />
      </div>

      {/* AMM Markets */}
      <div className="flex-1 border-b border-sidebar-border overflow-auto">
        <AMMMarkets />
      </div>

      {/* Quick Actions */}
      <div className="p-4">
        <QuickActions onAction={onQuickAction} />
      </div>
    </aside>
  )
}