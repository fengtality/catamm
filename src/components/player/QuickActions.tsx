
import React from 'react'
import { Button } from '@/components/ui/button'

interface QuickActionsProps {
  onAction: (action: string) => void
}

export default function QuickActions({ onAction }: QuickActionsProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-mono font-semibold mb-2">Quick Actions</h3>
      <Button
        onClick={() => onAction('build-port')}
        className="w-full"
        variant="default"
      >
        Build AMM Port
      </Button>
      <Button
        onClick={() => onAction('trade')}
        className="w-full"
        variant="secondary"
      >
        Trade Resources
      </Button>
      <Button
        onClick={() => onAction('end-turn')}
        className="w-full"
        variant="outline"
      >
        End Turn
      </Button>
    </div>
  )
}