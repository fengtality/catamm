# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CATAMM (Catan + AMM) is an innovative board game that combines the classic mechanics of Settlers of Catan with Automated Market Maker (AMM) trading systems. Instead of trading resources through banks or other players, players interact with AMM pools that dynamically price resource exchanges.

The game uses a fixed 2D hexagonal board with 3 rings (37 hexes total), similar to the standard Settlers of Catan board. Players can build AMM ports on portable vertices around the board.

## Current Project Status

This is an exploratory repository focused on:
1. Building initial game assets and mechanics using TypeScript for UI elements
2. Python for data analysis and game balance testing
3. Prototyping the core AMM integration with Catan mechanics

## Directory Structure

```
catamm/
├── src/                    # Source code
│   ├── game/              # Core game logic
│   │   └── board_setup.js # Board initialization module
│   ├── ui/                # UI components (TypeScript)
│   ├── utils/             # Utility functions
│   └── types/             # TypeScript type definitions
├── tests/                  # Test files
├── experiments/            # Experimental code and prototypes
│   ├── board-visualization/   # Board layout experiments
│   └── legacy-implementation/ # Previous JS implementation
├── data/                   # Game data and analytics
├── scripts/                # Build and utility scripts
├── docs/                   # Documentation
│   ├── game-design.md     # Core game design document
│   └── game-mechanics-spec.md # Detailed mechanics specification
├── images/                 # Project assets
└── reference/              # Reference implementations
    ├── catanatron-ui/     # React/TypeScript Catan UI
    └── settlers_of_catan_RL/ # Python Catan with RL
```

## Core Game Mechanics

### Resources
- 5 resource types: Wood (Wo), Brick (B), Sheep (S), Wheat (Wh), Ore (O)
- No currency tokens (removed SOL tokens from original design)

### AMM Markets
- 10 possible resource pair markets (all combinations of 5 resources)
- 9 ports on the board, each hosting an AMM market
- 1 market is always inactive (determined at game start)
- Constant product formula: x * y = k
- Trading fees: 0% for port owners, 10% for others

### Board Layout
- Fixed 2D hexagonal board with 3 rings (37 hexes total)
- Standard hex pattern similar to Settlers of Catan
- Players can build AMM ports on portable vertices
- Ports ARE the AMM markets (not separate entities)

### Ghost Ship Mechanics
- Activated on roll of 7 or when playing a knight
- Player chooses ONE action:
  1. Block a hex (like traditional robber) + steal from a player
  2. Flip a port market (swap active/inactive) + steal from the pool

### Victory Conditions
- Standard Catan: 10 victory points
- Points from: settlements (1), cities (2), longest road (2), largest army (2)
- Development cards work as in standard Catan

## Technical Implementation

### Board Initialization
The `src/game/board_setup.js` module provides:
- `initializeCatanBoard()` - Creates proper hex layout with coordinates
- `getPortPlacements()` - Returns 9 port positions with edge connections
- Axial coordinate system for hex grid calculations
- Complete neighbor and edge mappings

### Key Development Patterns
1. **TypeScript First**: All new UI code should be in TypeScript
2. **Functional Components**: Use React hooks and functional components
3. **Immutable State**: Avoid direct mutations, use immutable updates
4. **Type Safety**: Define interfaces for all game objects
5. **Testing**: Write tests for game logic and AMM calculations

### AMM Implementation Guidelines
```typescript
// Example AMM swap calculation
function calculateSwap(
  reserveIn: number,
  reserveOut: number,
  amountIn: number,
  feeRate: number
): number {
  const amountInWithFee = amountIn * (1 - feeRate);
  const amountOut = (reserveOut * amountInWithFee) / (reserveIn + amountInWithFee);
  return amountOut;
}
```

## Reference Implementations

### Catanatron UI (`reference/catanatron-ui/`)
- Modern React/TypeScript implementation
- Redux state management
- Hexagonal grid rendering system
- WebSocket multiplayer support

Key files to reference:
- Board rendering: `src/pages/Board.tsx`
- Hex coordinates: `src/utils/coordinates.ts`
- Game state: `src/store.tsx`

### Settlers of Catan RL (`reference/settlers_of_catan_RL/`)
- Python implementation with game engine
- Reinforcement learning integration
- Complete game rules implementation

Key modules:
- Game logic: `game/game.py`
- Board setup: `game/components/board.py`
- Player actions: `game/components/player.py`

## Development Guidelines

### When Building UI Components
1. Start with TypeScript interfaces for all props and state
2. Use the board coordinate system from `board_setup.js`
3. Reference Catanatron UI for rendering patterns
4. Keep components pure and testable

### When Implementing Game Logic
1. Separate game rules from UI concerns
2. Use immutable operations for state changes
3. Validate all player actions before applying
4. Log all game events for analytics

### When Working with AMMs
1. Ensure constant product invariant (x * y = k) is maintained
2. Apply fees correctly (0% for owners, 10% for others)
3. Handle edge cases (empty pools, rounding)
4. Track all trades for analysis

## Current Focus Areas

1. **Board Visualization**: Creating proper hex grid with port placements
2. **AMM Mechanics**: Implementing resource pair markets with correct math
3. **Game State Management**: Designing efficient state structure
4. **UI Prototyping**: Building interactive board components
5. **Analytics Tools**: Python scripts for game balance analysis

## Important Notes

- This is an exploratory repo - expect rapid iteration
- Focus on getting core mechanics right before optimization
- Use reference implementations for patterns, not direct copying
- Document all design decisions and trade-offs
- Keep AMM calculations precise to avoid exploits

## Previous Implementation Notes

The `experiments/legacy-implementation/` directory contains the original JavaScript implementation with SOL token integration. This has been superseded by the new design that uses direct resource-to-resource AMM markets without a base currency token.