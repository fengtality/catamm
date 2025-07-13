
import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  currentPlayer: number
  turn: number
  phase: 'setup' | 'play' | 'end'
}

export default function Header({ currentPlayer, turn, phase }: HeaderProps) {
  return (
    <header className={cn("h-16 bg-background border-b border-border flex items-center justify-between px-6")}>
      {/* Logo Section */}
      <div className="flex items-center">
        <h1 className="text-2xl font-mono font-bold">CATAMM</h1>
        <span className="ml-2 text-sm text-muted-foreground font-mono">Catan + AMM</span>
      </div>

      {/* Game Status */}
      <div className="flex items-center space-x-8">
        <div className="flex items-center space-x-6 text-sm font-mono">
          <div className="flex items-center">
            <span className="text-muted-foreground mr-2">Turn:</span>
            <span className="font-semibold">{turn}</span>
          </div>
          <div className="flex items-center">
            <span className="text-muted-foreground mr-2">Player:</span>
            <span className="font-semibold text-primary">{currentPlayer}</span>
          </div>
          <div className="flex items-center">
            <span className="text-muted-foreground mr-2">Phase:</span>
            <span className="font-semibold capitalize">{phase}</span>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </Button>
      </div>
    </header>
  )
}