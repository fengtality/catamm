
import React from 'react'

interface QuickActionsProps {
  onAction: (action: string) => void
}

export default function QuickActions({ onAction }: QuickActionsProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold mb-2">Quick Actions</h3>
      <button
        onClick={() => onAction('build-port')}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Build AMM Port
      </button>
      <button
        onClick={() => onAction('trade')}
        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        Trade Resources
      </button>
      <button
        onClick={() => onAction('end-turn')}
        className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
      >
        End Turn
      </button>
    </div>
  )
}