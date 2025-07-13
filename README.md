# CATAMM - Catan with Automated Market Makers

<div align="center">
  <img src="images/catamm-logo.png" alt="CATAMM Logo" width="200"/>
  
  **A strategic board game combining Settlers of Catan with DeFi-style AMM trading**
</div>

## Overview

CATAMM reimagines resource trading in Settlers of Catan by replacing traditional player-to-player negotiations with Automated Market Maker (AMM) pools. Each port on the board hosts a dynamic market where resources are exchanged using constant product formulas, creating an ever-changing economic landscape.

## Key Features

- **Dynamic Pricing**: Resource values fluctuate based on supply and demand
- **Strategic Port Control**: Own a port for 0% trading fees vs 10% for others
- **Ghost Ship Mechanics**: Choose between blocking resources or flipping markets
- **Pure Resource Economy**: No currency tokens - direct resource-to-resource swaps
- **Balanced Gameplay**: 9 active markets from 10 possible pairs ensure variety

## Game Mechanics

### Resources
- Wood (Wo)
- Brick (B) 
- Sheep (S)
- Wheat (Wh)
- Ore (O)

### AMM Markets
- 10 possible resource pair combinations
- 9 ports on the board, each hosting one market
- 1 market always inactive (randomly determined)
- Constant product formula: `x * y = k`

### Port Distribution
- 3 single-edge ports
- 6 double-edge ports
- Strategically placed around the board perimeter

## Project Status

🚧 **Early Development** - This is an exploratory repository focused on prototyping core mechanics.

### Current Progress
- ✅ Board layout and hex positioning system
- ✅ Port placement logic
- ✅ Game design documentation
- 🔄 AMM implementation
- 🔄 UI components in TypeScript
- 📋 Game balance analysis tools

## Tech Stack

- **Frontend**: TypeScript, React
- **Game Logic**: TypeScript/JavaScript
- **Analysis**: Python
- **Build Tools**: TBD

## Getting Started

### Prerequisites
```bash
# Install Node.js and npm
# Install Python 3.x for analysis tools
```

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/catamm.git
cd catamm

# Install dependencies (coming soon)
# npm install
```

### Development
```bash
# Run board visualization experiments
open experiments/board-visualization/hex_edges.html

# View game design docs
open docs/game-design.md
```

## Project Structure

```
catamm/
├── src/              # Source code
├── tests/            # Test files
├── experiments/      # Prototypes and experiments
├── docs/            # Documentation
├── reference/       # Reference implementations
└── data/           # Game data and analytics
```

## Contributing

This is an exploratory project. Feel free to:
- Experiment with game mechanics
- Propose UI improvements
- Analyze game balance
- Suggest new features

## References

- [Settlers of Catan Rules](reference/CATAN–The%20Game%20Rulebook%20secure%20(1).pdf)
- [Catanatron UI](reference/catanatron-ui/) - React/TypeScript reference
- [Settlers RL](reference/settlers_of_catan_RL/) - Python game engine

## License

TBD - This is an experimental project

## Acknowledgments

- Inspired by Klaus Teuber's Settlers of Catan
- AMM concepts from DeFi protocols like Uniswap
- Reference implementations from the open-source community