
import React, { useRef, useEffect } from 'react'
import { GameLogEntry } from '../shared/types'

interface GameLogProps {
  entries: GameLogEntry[]
}

export default function GameLog({ entries }: GameLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [entries])

  const getEntryColor = (type: GameLogEntry['type']) => {
    switch (type) {
      case 'command':
        return 'text-primary'
      case 'discovery':
        return 'text-accent-foreground'
      case 'system':
        return 'text-muted-foreground'
      default:
        return 'text-foreground'
    }
  }

  return (
    <div className="h-full flex flex-col p-4">
      <h3 className="text-lg font-mono font-semibold mb-3">Game Log</h3>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto font-mono text-xs space-y-1"
      >
        {entries.length === 0 ? (
          <div className="text-muted-foreground">
            Game started. Type 'help' for commands.
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className={`${getEntryColor(entry.type)} break-words`}
            >
              <span className="text-muted-foreground">
                [{entry.timestamp.toLocaleTimeString()}]
              </span>{' '}
              {entry.message}
            </div>
          ))
        )}
      </div>
    </div>
  )
}