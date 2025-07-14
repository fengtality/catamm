
import { Resource } from '@/types'

interface HexShapeProps {
  points: string
  resource: Resource | null
  isSelected: boolean
  hasRobber?: boolean
}

export default function HexShape({
  points,
  resource,
  isSelected,
  hasRobber = false
}: HexShapeProps) {
  // Map resources to CSS variable names
  const getResourceColor = (resource: Resource | null): string => {
    if (!resource) return 'var(--resource-desert)'
    
    const colorMap: Record<Resource, string> = {
      [Resource.Wood]: 'var(--resource-wood)',
      [Resource.Brick]: 'var(--resource-brick)',
      [Resource.Sheep]: 'var(--resource-sheep)',
      [Resource.Wheat]: 'var(--resource-wheat)',
      [Resource.Ore]: 'var(--resource-ore)'
    }
    
    return colorMap[resource]
  }

  return (
    <>
      <polygon
        points={points}
        fill={getResourceColor(resource)}
        className={isSelected ? 'brightness-110' : ''}
        style={{
          filter: isSelected ? 'brightness(1.2)' : hasRobber ? 'brightness(0.5)' : undefined,
          transition: 'filter 0.2s ease'
        }}
      />
      {/* Dark overlay when robber is present */}
      {hasRobber && (
        <polygon
          points={points}
          fill="black"
          opacity={0.3}
        />
      )}
    </>
  )
}