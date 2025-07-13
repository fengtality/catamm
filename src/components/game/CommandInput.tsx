
import React, { useState } from 'react'

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
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Enter command..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </form>
      <div className="mt-2 text-xs text-gray-600">
        Commands: build settlement/city, roll, trade, end
      </div>
    </div>
  )
}