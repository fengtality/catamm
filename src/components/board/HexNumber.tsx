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
  const textColor = isHighProbability ? 'var(--token-red)' : `rgba(0, 0, 0, ${0.3 + dots * 0.15})`

  return (
    <g className="hex-number">
      {/* Token background shadow */}
      <circle
        cx={x}
        cy={y + 2}
        r={22}
        fill="black"
        opacity={0.2}
      />
      
      {/* Token background */}
      <circle
        cx={x}
        cy={y}
        r={22}
        fill="var(--token-bg-light)"
        stroke="var(--token-border)"
        strokeWidth={2}
      />
      
      {/* Token inner gradient */}
      <circle
        cx={x}
        cy={y}
        r={18}
        fill="var(--token-bg-mid)"
        opacity={0.6}
      />
      
      {/* Number text */}
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xl font-bold font-mono select-none"
        fill={textColor}
        style={{ pointerEvents: 'none' }}
      >
        {number}
      </text>
      
      {/* Probability dots */}
      <g className="probability-dots">
        {Array.from({ length: dots }, (_, i) => (
          <circle
            key={i}
            cx={x + (i - (dots - 1) / 2) * 6}
            cy={y + 12}
            r={1.5}
            fill={textColor}
            opacity={0.8}
          />
        ))}
      </g>
    </g>
  )
}