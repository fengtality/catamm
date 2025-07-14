
import { useRef, useEffect, useState } from 'react'
import { GameLogEntry } from '../shared/types'
import { Input } from '@/components/ui/input'

interface GameLogProps {
  entries: GameLogEntry[]
  onCommand?: (command: string) => void
  currentPlayer?: number
}

export default function GameLog({ entries, onCommand }: GameLogProps) {
  const [chatInput, setChatInput] = useState('')
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (chatInput.trim() && onCommand) {
      onCommand(chatInput)
      setChatInput('')
    }
  }

  return (
    <div className="h-full w-full flex flex-col min-w-0">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto font-mono text-xs space-y-1 p-4 min-w-0"
      >
        {entries.length === 0 ? (
          <div className="text-muted-foreground">
            Game started. Type &apos;help&apos; for commands.
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className={`${getEntryColor(entry.type)} break-words whitespace-pre-wrap`}
            >
              <span className="text-muted-foreground">
                [{entry.timestamp.toLocaleTimeString()}]
              </span>{' '}
              {entry.message}
            </div>
          ))
        )}
      </div>
      {onCommand && (
        <div className="border-t border-sidebar-border flex-shrink-0">
          <form onSubmit={handleSubmit} className="p-4">
            <Input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="> chat..."
              className="font-mono focus-visible:ring-offset-0"
            />
          </form>
        </div>
      )}
    </div>
  )
}