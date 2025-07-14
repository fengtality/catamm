import { Resource } from '@/types/game.types'
import { Button } from '@/components/ui/button'
import { ArrowRightLeft } from 'lucide-react'

interface ResourcesWithTradeProps {
  totalResources: Record<Resource, number>
  playerResources: Record<Resource, number>
  onTradeClick: (resource: Resource) => void
}

export default function ResourcesWithTrade({ 
  totalResources, 
  playerResources, 
  onTradeClick 
}: ResourcesWithTradeProps) {
  const resourceDisplay = [
    { type: Resource.Wood, label: 'Wood', emoji: '🪵', color: 'text-green-600' },
    { type: Resource.Brick, label: 'Brick', emoji: '🧱', color: 'text-red-600' },
    { type: Resource.Sheep, label: 'Sheep', emoji: '🐑', color: 'text-gray-600' },
    { type: Resource.Wheat, label: 'Wheat', emoji: '🌾', color: 'text-yellow-600' },
    { type: Resource.Ore, label: 'Ore', emoji: '⛰️', color: 'text-gray-800' },
  ]
  
  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="text-lg font-mono font-semibold mb-3">Total Resources</h3>
        <div className="space-y-2">
          {resourceDisplay.map(({ type, label, emoji }) => (
            <div key={type} className="flex items-center justify-between text-sm font-mono">
              <div className="flex items-center space-x-2">
                <span>{emoji}</span>
                <span className="text-muted-foreground">{label}:</span>
              </div>
              <span className="font-semibold">{totalResources[type] || 0}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-sidebar-border pt-4">
        <h3 className="text-lg font-mono font-semibold mb-3">Your Resources</h3>
        <div className="space-y-2">
          {resourceDisplay.map(({ type, label, emoji, color }) => (
            <div key={type} className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm font-mono">
                <span>{emoji}</span>
                <span className="text-muted-foreground">{label}:</span>
                <span className={`font-semibold ${color}`}>
                  {playerResources[type] || 0}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onTradeClick(type)}
                className="h-8 px-2"
                disabled={(playerResources[type] || 0) === 0}
              >
                <ArrowRightLeft className="h-4 w-4" />
                <span className="ml-1">Trade</span>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}