
import React, { useState } from 'react'
import { Input } from '@/components/ui/input'

interface CommandInputProps {
  onSubmit: (command: string) => void
}

export default function CommandInput({ onSubmit }: CommandInputProps) {
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
      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Enter command..."
        />
      </form>
      <div className="mt-2 text-xs text-muted-foreground font-mono">
        Commands: build settlement/city, roll, trade, end
      </div>
    </div>
  )
}