import React from 'react'

interface HexNumberProps {
  x: number
  y: number
  number: number
}

export default function HexNumber({ x, y, number }: HexNumberProps) {
  // Red for 6 and 8 (high probability)
  const isHighProbability = number === 6 || number === 8
  
  // Calculate probability dots
  const getProbabilityDots = (num: number): number => {
    const dots: Record<number, number> = {
      2: 1, 3: 2, 4: 3, 5: 4, 6: 5,
      8: 5, 9: 4, 10: 3, 11: 2, 12: 1
    }
    return dots[num] || 0
  }
  
  const dots = getProbabilityDots(number)
  const radius = 32 // Larger radius for better visibility

  return (
    <g className="hex-number">
      {/* Clean shadow */}
      <circle
        cx={x}
        cy={y + 3}
        r={radius}
        fill="var(--shadow-light)"
      />
      
      {/* Main circle background */}
      <circle
        cx={x}
        cy={y}
        r={radius}
        fill="var(--card)"
        stroke="var(--border)"
        strokeWidth={1}
      />
      
      {/* Number text */}
      <text
        x={x}
        y={y - 3}
        textAnchor="middle"
        dominantBaseline="central"
        fill={isHighProbability ? 'var(--destructive)' : 'var(--foreground)'}
        style={{ 
          fontSize: '28px',
          fontWeight: 'bold',
          fontFamily: 'var(--font-mono)',
          pointerEvents: 'none'
        }}
      >
        {number}
      </text>
      
      {/* Probability dots */}
      <g className="probability-dots">
        {Array.from({ length: dots }, (_, i) => (
          <circle
            key={i}
            cx={x + (i - (dots - 1) / 2) * 7}
            cy={y + 18}
            r={2}
            fill={isHighProbability ? 'var(--destructive)' : 'var(--muted-foreground)'}
          />
        ))}
      </g>
    </g>
  )
}