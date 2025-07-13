
import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface CommandInputProps {
  onSubmit: (command: string) => void
  onQuickAction: (action: string) => void
  currentPlayer?: number
}

export default function CommandInput({ onSubmit, onQuickAction, currentPlayer }: CommandInputProps) {
  const [command, setCommand] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (command.trim()) {
      onSubmit(command)
      setCommand('')
    }
  }

  const playerColor = currentPlayer ? `var(--player-${currentPlayer})` : 'var(--foreground)'
  
  return (
    <div className="p-4">
      <h3 className="text-lg font-mono font-semibold mb-3">
        Command Input
        {currentPlayer && (
          <span className="ml-2 text-sm font-normal">
            (Player <span style={{ color: playerColor }}>{currentPlayer}</span>)
          </span>
        )}
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">&gt;</span>
          <Input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="build settlement..."
            className="pl-8 font-mono"
          />
        </div>
      </form>
      <div className="mt-3 flex items-center space-x-2">
        {/* Settlement */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onQuickAction('build-settlement')}
          className="h-8 w-8"
          title="Build Settlement"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3L4 9V21H9V14H15V21H20V9L12 3Z" />
          </svg>
        </Button>

        {/* City */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onQuickAction('build-city')}
          className="h-8 w-8"
          title="Build City"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15 3V7H19V3H15ZM5 8V21H11V15H13V21H19V8L17 8V10H15V8H13V10H11V8H9V10H7V8H5Z" />
          </svg>
        </Button>

        {/* Road */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onQuickAction('build-road')}
          className="h-8 w-8"
          title="Build Road"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <rect x="4" y="11" width="16" height="2" />
          </svg>
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Trade */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onQuickAction('trade')}
          className="h-8 w-8"
          title="Trade"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </Button>

        {/* End Turn */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onQuickAction('end-turn')}
          className="h-8 w-8"
          title="End Turn"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </Button>
      </div>
    </div>
  )
}