import { useState, useMemo, useCallback } from 'react'
import { AMMPool, Resource } from '@/types/game.types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ArrowDown, Info } from 'lucide-react'

interface AMMWidgetProps {
  ammPool: AMMPool | null
  playerResources: Record<Resource, number>
  isOwner: boolean
  onSwap: (resourceIn: Resource, amountIn: number, resourceOut: Resource, amountOut: number) => void
  onDeposit: (amountA: number, amountB: number) => void
  onWithdraw: (liquidityAmount: number) => void
  onClose?: () => void
}

export default function AMMWidget({
  ammPool,
  playerResources,
  isOwner,
  onSwap,
  onDeposit,
  onWithdraw,
  onClose
}: AMMWidgetProps) {
  const [swapAmountIn, setSwapAmountIn] = useState('')
  const [swapDirection, setSwapDirection] = useState<'AtoB' | 'BtoA'>('AtoB')
  const [depositAmountA, setDepositAmountA] = useState('')
  const [depositAmountB, setDepositAmountB] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')

  const resourceA = ammPool?.resourceA || Resource.Wood
  const resourceB = ammPool?.resourceB || Resource.Brick
  const feeRate = isOwner ? 0 : 0.1

  // Calculate swap output
  const calculateSwapOutput = useCallback((amountIn: number, direction: 'AtoB' | 'BtoA'): number => {
    if (!ammPool || !ammPool.isActive || amountIn <= 0) return 0
    
    const [reserveIn, reserveOut] = direction === 'AtoB' 
      ? [ammPool.reserveA, ammPool.reserveB]
      : [ammPool.reserveB, ammPool.reserveA]
    
    const amountInWithFee = amountIn * (1 - feeRate)
    const amountOut = (reserveOut * amountInWithFee) / (reserveIn + amountInWithFee)
    
    return Math.floor(amountOut)
  }, [ammPool, feeRate])

  const swapAmountOut = useMemo(() => {
    const amount = parseFloat(swapAmountIn) || 0
    return calculateSwapOutput(amount, swapDirection)
  }, [swapAmountIn, swapDirection, calculateSwapOutput])

  if (!ammPool) {
    return null
  }

  const resourceIn = swapDirection === 'AtoB' ? resourceA : resourceB
  const resourceOut = swapDirection === 'AtoB' ? resourceB : resourceA

  const handleSwap = () => {
    const amountIn = parseFloat(swapAmountIn)
    if (amountIn > 0 && swapAmountOut > 0) {
      onSwap(resourceIn, amountIn, resourceOut, swapAmountOut)
      setSwapAmountIn('')
    }
  }

  const handleDeposit = () => {
    const amountA = parseFloat(depositAmountA)
    const amountB = parseFloat(depositAmountB)
    if (amountA > 0 && amountB > 0) {
      onDeposit(amountA, amountB)
      setDepositAmountA('')
      setDepositAmountB('')
    }
  }

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount)
    if (amount > 0) {
      onWithdraw(amount)
      setWithdrawAmount('')
    }
  }

  const toggleSwapDirection = () => {
    setSwapDirection(prev => prev === 'AtoB' ? 'BtoA' : 'AtoB')
    setSwapAmountIn('')
  }

  const getResourceDisplay = (resource: Resource) => {
    const displays: Record<Resource, { emoji: string; name: string; color: string }> = {
      [Resource.Wood]: { emoji: '🪵', name: 'Wood', color: 'var(--resource-wood)' },
      [Resource.Brick]: { emoji: '🧱', name: 'Brick', color: 'var(--resource-brick)' },
      [Resource.Sheep]: { emoji: '🐑', name: 'Sheep', color: 'var(--resource-sheep)' },
      [Resource.Wheat]: { emoji: '🌾', name: 'Wheat', color: 'var(--resource-wheat)' },
      [Resource.Ore]: { emoji: '⛰️', name: 'Ore', color: 'var(--resource-ore)' }
    }
    return displays[resource]
  }

  return (
    <div className="w-full bg-background">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-mono font-semibold flex items-center space-x-1">
            <span style={{ color: getResourceDisplay(resourceA).color }}>
              {getResourceDisplay(resourceA).emoji}
            </span>
            <span>{getResourceDisplay(resourceA).name}</span>
            <span className="text-muted-foreground">-</span>
            <span style={{ color: getResourceDisplay(resourceB).color }}>
              {getResourceDisplay(resourceB).emoji}
            </span>
            <span>{getResourceDisplay(resourceB).name}</span>
          </h3>
          {onClose && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <span className="text-lg">×</span>
            </Button>
          )}
        </div>
        <div className="font-mono text-xs text-muted-foreground mt-1">
          {ammPool.isActive ? (
            <>
              Pool: {ammPool.reserveA} {resourceA} / {ammPool.reserveB} {resourceB}
              {isOwner && <span className="text-green-600 ml-2">(You own this port - 0% fee)</span>}
              {!isOwner && ammPool.owner !== undefined && <span className="text-orange-600 ml-2">(10% fee to P{ammPool.owner})</span>}
              {!isOwner && ammPool.owner === undefined && <span className="text-muted-foreground ml-2">(No owner)</span>}
            </>
          ) : (
            <span className="text-red-600">Market Inactive</span>
          )}
        </div>
      </div>
      
      <div className="p-4">
        <Tabs defaultValue="swap" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="swap" disabled={!ammPool.isActive}>Swap</TabsTrigger>
            <TabsTrigger value="deposit" disabled={!ammPool.isActive}>Deposit</TabsTrigger>
            <TabsTrigger value="withdraw" disabled={!ammPool.isActive || !isOwner}>Withdraw</TabsTrigger>
          </TabsList>
          
          <TabsContent value="swap" className="space-y-4">
            <div className="space-y-2">
              <div className="p-3 border border-border">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
                  <span className="font-mono">From</span>
                  <span className="font-mono">Balance: {playerResources[resourceIn] || 0}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={swapAmountIn}
                    onChange={(e) => setSwapAmountIn(e.target.value)}
                    placeholder="0"
                    className="flex-1"
                    min="0"
                    max={playerResources[resourceIn] || 0}
                  />
                  <div className="flex items-center space-x-1 font-mono">
                    <span style={{ color: getResourceDisplay(resourceIn).color }}>
                      {getResourceDisplay(resourceIn).emoji}
                    </span>
                    <span>{getResourceDisplay(resourceIn).name}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSwapDirection}
                  className="h-8 w-8 p-0 border border-border"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="p-3 border border-border bg-muted/50">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
                  <span className="font-mono">To</span>
                  <span className="font-mono">Pool: {swapDirection === 'AtoB' ? ammPool.reserveB : ammPool.reserveA}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 h-10 flex items-center px-3 border border-border bg-background font-mono">
                    {swapAmountOut || '0'}
                  </div>
                  <div className="flex items-center space-x-1 font-mono">
                    <span style={{ color: getResourceDisplay(resourceOut).color }}>
                      {getResourceDisplay(resourceOut).emoji}
                    </span>
                    <span>{getResourceDisplay(resourceOut).name}</span>
                  </div>
                </div>
              </div>
              
              {swapAmountIn && parseFloat(swapAmountIn) > 0 && (
                <div className="text-xs text-muted-foreground font-mono space-y-1">
                  <div>Rate: 1 {resourceIn} = {(swapAmountOut / parseFloat(swapAmountIn)).toFixed(3)} {resourceOut}</div>
                  {!isOwner && <div>Fee: {(parseFloat(swapAmountIn) * 0.1).toFixed(1)} {resourceIn}</div>}
                </div>
              )}
              
              <Button 
                onClick={handleSwap} 
                className="w-full"
                disabled={!swapAmountIn || parseFloat(swapAmountIn) <= 0 || swapAmountOut <= 0}
              >
                Swap
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="deposit" className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 border border-border">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
                  <span className="font-mono">{resourceA}</span>
                  <span className="font-mono">Balance: {playerResources[resourceA] || 0}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={depositAmountA}
                    onChange={(e) => setDepositAmountA(e.target.value)}
                    placeholder="0"
                    className="flex-1"
                    min="0"
                    max={playerResources[resourceA] || 0}
                  />
                  <div className="flex items-center space-x-1 font-mono">
                    <span style={{ color: getResourceDisplay(resourceA).color }}>
                      {getResourceDisplay(resourceA).emoji}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-3 border border-border">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
                  <span className="font-mono">{resourceB}</span>
                  <span className="font-mono">Balance: {playerResources[resourceB] || 0}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={depositAmountB}
                    onChange={(e) => setDepositAmountB(e.target.value)}
                    placeholder="0"
                    className="flex-1"
                    min="0"
                    max={playerResources[resourceB] || 0}
                  />
                  <div className="flex items-center space-x-1 font-mono">
                    <span style={{ color: getResourceDisplay(resourceB).color }}>
                      {getResourceDisplay(resourceB).emoji}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-muted text-xs text-muted-foreground font-mono flex items-start space-x-2">
                <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <div>
                  <div>Current ratio: {ammPool.reserveA}:{ammPool.reserveB}</div>
                  <div>You must deposit at the current ratio to maintain pool balance</div>
                </div>
              </div>
              
              <Button 
                onClick={handleDeposit} 
                className="w-full"
                disabled={!depositAmountA || !depositAmountB || parseFloat(depositAmountA) <= 0 || parseFloat(depositAmountB) <= 0}
              >
                Add Liquidity
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="withdraw" className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 border border-border">
                <div className="text-sm text-muted-foreground mb-1 font-mono">
                  Liquidity to withdraw
                </div>
                <Input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0"
                  className="w-full"
                  min="0"
                />
              </div>
              
              <div className="p-3 bg-muted text-xs text-muted-foreground font-mono">
                <div>Current pool: {ammPool.reserveA} {resourceA} / {ammPool.reserveB} {resourceB}</div>
                <div className="mt-1">You will receive both resources proportionally</div>
              </div>
              
              <Button 
                onClick={handleWithdraw} 
                className="w-full"
                disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0}
              >
                Remove Liquidity
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}