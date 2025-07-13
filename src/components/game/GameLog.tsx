
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
        return 'text-blue-600'
      case 'discovery':
        return 'text-orange-600'
      case 'system':
        return 'text-gray-600'
      default:
        return 'text-gray-800'
    }
  }

  return (
    <div className="h-full flex flex-col p-4">
      <h3 className="text-lg font-semibold mb-3">Game Log</h3>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto font-mono text-xs space-y-1"
      >
        {entries.length === 0 ? (
          <div className="text-gray-500">
            Game started. Type 'help' for commands.
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className={`${getEntryColor(entry.type)} break-words`}
            >
              <span className="text-gray-500">
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