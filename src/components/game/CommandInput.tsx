
import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface CommandInputProps {
  onSubmit: (command: string) => void
  onQuickAction: (action: string) => void
}

export default function CommandInput({ onSubmit, onQuickAction }: CommandInputProps) {
  const [command, setCommand] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (command.trim()) {
      onSubmit(command)
      setCommand('')
    }
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-mono font-semibold mb-3">Command Input</h3>
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
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onQuickAction('build')}
          className="h-8 w-8"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onQuickAction('trade')}
          className="h-8 w-8"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onQuickAction('end-turn')}
          className="h-8 w-8"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </Button>
      </div>
    </div>
  )
}