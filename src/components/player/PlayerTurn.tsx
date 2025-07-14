import { Button } from '@/components/ui/button'
import { Resource, BUILDING_COSTS } from '@/types'
import { DevCard, canPlayDevCard } from '@/types/development-cards'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface PlayerTurnProps {
  onQuickAction: (action: string) => void
  currentPlayer?: number
  currentTurn?: number
  playerResources?: Record<Resource, number>
  playerDevCards?: number
  playerDevCardsArray?: DevCard[]
  gamePhase?: string
  setupRound?: number
  setupBuildings?: number
  hasResourcesFor?: (purchaseType: 'Settlement' | 'City' | 'Road' | 'DevCard') => boolean
  lastAction?: { message: string; type: 'success' | 'warning' | 'error' }
}

export default function PlayerTurn({ 
  onQuickAction, 
  currentPlayer, 
  currentTurn, 
  playerDevCards, 
  playerDevCardsArray, 
  gamePhase, 
  setupRound, 
  setupBuildings, 
  hasResourcesFor,
  lastAction
}: PlayerTurnProps) {
  const playerColor = currentPlayer ? `var(--player-${currentPlayer})` : 'var(--foreground)'
  
  // Helper to format cost string
  const formatCost = (costs: Record<string, number>) => {
    return Object.entries(costs)
      .filter(([, amount]) => amount > 0)
      .map(([resource, amount]) => `${amount} ${resource}`)
      .join(', ')
  }
  
  const isMainPhase = gamePhase === 'play'
  const isSetupPhase = gamePhase === 'setup'
  const needsSettlement = isSetupPhase && setupBuildings === 0
  const needsRoad = isSetupPhase && setupBuildings === 1
  
  // Count playable dev cards (excluding victory points and cards bought this turn)
  const playableDevCards = playerDevCardsArray?.filter(card => 
    canPlayDevCard(card, currentTurn || 1)
  ).length || 0
  
  const getActionColor = (type: 'success' | 'warning' | 'error') => {
    switch (type) {
      case 'success':
        return 'text-green-600 dark:text-green-400'
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'error':
        return 'text-destructive'
      default:
        return 'text-muted-foreground'
    }
  }

  return (
    <TooltipProvider delayDuration={100}>
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <div className="inline-flex items-center gap-4">
          {/* Player info */}
          <div className="flex items-center gap-3 pr-3 border-r border-border">
            <span className="text-sm font-mono font-semibold" style={{ color: playerColor }}>
              Player {currentPlayer}
            </span>
            <span className="text-xs font-mono text-muted-foreground">
              {gamePhase === 'setup' ? `Setup ${setupRound}/2` : `Turn ${currentTurn}`}
            </span>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
          {/* Settlement */}
          <Tooltip>
            <TooltipTrigger asChild>
              <span style={{ display: 'inline-flex' }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onQuickAction('build-settlement')}
                  className="h-9 w-9"
                  disabled={(isMainPhase && (!hasResourcesFor || !hasResourcesFor('Settlement'))) || (isSetupPhase && !needsSettlement)}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3L4 9V21H9V14H15V21H20V9L12 3Z" />
                  </svg>
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Build Settlement</p>
              <p className="text-xs text-muted-foreground">Cost: {formatCost(BUILDING_COSTS.Settlement)}</p>
              {isMainPhase && (!hasResourcesFor || !hasResourcesFor('Settlement')) && (
                <p className="text-xs text-destructive">Not enough resources!</p>
              )}
              {isSetupPhase && !needsSettlement && (
                <p className="text-xs text-muted-foreground">Place a road first</p>
              )}
            </TooltipContent>
          </Tooltip>

          {/* Road */}
          <Tooltip>
            <TooltipTrigger asChild>
              <span style={{ display: 'inline-flex' }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onQuickAction('build-road')}
                  className="h-9 w-9"
                  disabled={(isMainPhase && (!hasResourcesFor || !hasResourcesFor('Road'))) || (isSetupPhase && !needsRoad)}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="4" y="11" width="16" height="2" />
                  </svg>
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Build Road</p>
              <p className="text-xs text-muted-foreground">Cost: {formatCost(BUILDING_COSTS.Road)}</p>
              {isMainPhase && (!hasResourcesFor || !hasResourcesFor('Road')) && (
                <p className="text-xs text-destructive">Not enough resources!</p>
              )}
              {isSetupPhase && !needsRoad && (
                <p className="text-xs text-muted-foreground">Place a settlement first</p>
              )}
            </TooltipContent>
          </Tooltip>

          {/* City */}
          <Tooltip>
            <TooltipTrigger asChild>
              <span style={{ display: 'inline-flex' }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onQuickAction('build-city')}
                  className="h-9 w-9"
                  disabled={(isMainPhase && (!hasResourcesFor || !hasResourcesFor('City'))) || isSetupPhase}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M15 3V7H19V3H15ZM5 8V21H11V15H13V21H19V8L17 8V10H15V8H13V10H11V8H9V10H7V8H5Z" />
                  </svg>
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Build City</p>
              <p className="text-xs text-muted-foreground">Cost: {formatCost(BUILDING_COSTS.City)}</p>
              {isMainPhase && (!hasResourcesFor || !hasResourcesFor('City')) && (
                <p className="text-xs text-destructive">Not enough resources!</p>
              )}
              {isSetupPhase && (
                <p className="text-xs text-muted-foreground">Not available during setup</p>
              )}
            </TooltipContent>
          </Tooltip>

          {/* Buy Dev Card */}
          <Tooltip>
            <TooltipTrigger asChild>
              <span style={{ display: 'inline-flex' }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onQuickAction('buy-dev-card')}
                  className="h-9 w-9"
                  disabled={(isMainPhase && (!hasResourcesFor || !hasResourcesFor('DevCard'))) || isSetupPhase}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 11l-4 4 1.41 1.41L12 15.83l2.59 2.58L16 17l-4-4z"/>
                    <path d="M7 7h10v5H7z"/>
                  </svg>
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Buy Development Card</p>
              <p className="text-xs text-muted-foreground">Cost: 1 Ore, 1 Wheat, 1 Sheep</p>
              {isMainPhase && (!hasResourcesFor || !hasResourcesFor('DevCard')) && (
                <p className="text-xs text-destructive">Not enough resources!</p>
              )}
              {isSetupPhase && (
                <p className="text-xs text-muted-foreground">Not available during setup</p>
              )}
            </TooltipContent>
          </Tooltip>

          {/* Use Dev Card */}
          <Tooltip>
            <TooltipTrigger asChild>
              <span style={{ display: 'inline-flex' }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onQuickAction('use-dev-card')}
                  className="h-9 w-9"
                  disabled={playableDevCards === 0}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Use Development Card</p>
              <p className="text-xs text-muted-foreground">
                {playableDevCards === 0 
                  ? (playerDevCards && playerDevCards > 0 
                    ? 'Cards bought this turn cannot be played'
                    : 'No cards available')
                  : `${playableDevCards} playable card${playableDevCards > 1 ? 's' : ''}`
                }
              </p>
            </TooltipContent>
          </Tooltip>

          {/* End Turn */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onQuickAction('end-turn')}
                className="h-9 w-9"
                disabled={gamePhase === 'setup'}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>End Turn</p>
              {gamePhase === 'setup' && (
                <p className="text-xs text-muted-foreground">Complete setup actions first</p>
              )}
            </TooltipContent>
          </Tooltip>
        </div>
        
        {/* Status text */}
        <div className="flex items-center pl-3 border-l border-border">
          <span className="text-xs font-mono text-muted-foreground">
            {isSetupPhase && needsSettlement && "Place settlement"}
            {isSetupPhase && needsRoad && "Place road"}
            {isMainPhase && "Choose action"}
          </span>
        </div>
      </div>
      
      {/* Action Feedback - Only show errors */}
      {lastAction && lastAction.type === 'error' && (
        <div className="mt-2 px-1">
          <p className={`text-xs font-mono ${getActionColor(lastAction.type)}`}>
            {lastAction.message}
          </p>
        </div>
      )}
    </div>
    </TooltipProvider>
  )
}