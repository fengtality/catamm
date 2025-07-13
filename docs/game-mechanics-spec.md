# CATAMM Game Mechanics Specification

## Overview
CATAMM (Catan + AMM) combines the classic board game Settlers of Catan with decentralized Automated Market Maker (AMM) trading mechanics. Players trade resources through liquidity pools instead of direct negotiation, creating dynamic market prices and new strategic dimensions.

## Core Mechanics Comparison

### What We Keep from Original Code
- Basic resource types (Wood, Brick, Sheep, Wheat, Ore)
- Building costs and victory point values
- Development card types and effects
- 2d6 dice probability distribution
- 10 VP win condition

### What We Change
- **Remove SOL token** → Pure resource-to-resource AMM pools
- **9 ports for 9 markets** → One market always missing
- **Ghost ship replaces robber** → Can block hex OR flip port market
- **Port benefits** → Reduced trading fees at port locations

## Detailed Game Specification

### 1. Board Setup

#### Physical Layout
- 19 hexagonal tiles in 3-4-5-4-3 formation
- 9 ports evenly distributed around perimeter
- 54 vertices for settlements/cities
- 72 edges for roads

#### Resource Distribution
```
3 Wood hexes
3 Brick hexes
4 Sheep hexes
3 Ore hexes
4 Wheat hexes
1 Desert hex (ghost ship starts here)
1 Gold hex (player chooses resource)
```

#### Number Token Distribution
```
Quantity | Numbers
---------|--------
1 each   | 2, 12
2 each   | 3, 4, 5, 6, 8, 9, 10, 11
0        | 7 (triggers ghost ship)
```

### 2. AMM Market System

#### Market Pairs
All 10 possible combinations of 5 resources:
```
1. Wood-Brick (W-B)      6. Brick-Ore (B-O)
2. Wood-Sheep (W-S)      7. Brick-Wheat (B-W)
3. Wood-Ore (W-O)        8. Sheep-Ore (S-O)
4. Wood-Wheat (W-W)      9. Sheep-Wheat (S-W)
5. Brick-Sheep (B-S)     10. Ore-Wheat (O-W)
```

#### Initial Market State
- 9 markets active (1 randomly missing)
- Each active pool: 1000 of each resource
- Constant k = 1,000,000 for each pool

#### Trading Mechanics
```javascript
// Constant Product AMM Formula
k = reserveA × reserveB

// Trade Calculation (A for B)
feeAmount = hasPort ? 0 : inputA × 0.10
actualInput = inputA - feeAmount
outputB = (reserveB × actualInput) / (reserveA + actualInput)
newReserveA = reserveA + actualInput  // fee is burned
newReserveB = reserveB - outputB

// Price Impact
priceImpact = 1 - (outputB / (actualInput × spotPrice))
```

#### Fee Structure
- **Port ownership (settlement/city at port)**: 0% fee
- **No port ownership**: 10% fee on swaps
- **Liquidity operations**: 
  - Deposit: Always free
  - Withdraw: 10% fee if you don't own the port
- Fees are burned (removed from circulation)

### 3. Ghost Ship Mechanics

#### Activation Triggers
- Rolling a 7
- Playing a Knight development card

#### Player Options (choose one)

**Option A: Block Hex**
```
1. Move ghost ship to any resource hex
2. Hex produces no resources while blocked
3. Steal 1 resource from a player on that hex
   - Weighted random selection based on their holdings
   - Example: Player has 5 wood, 2 brick → 5/7 chance to steal wood
```

**Option B: Flip Port Market**
```
1. Select any active port
2. Current market becomes the missing market
3. Selected port activates the previously missing market
4. Steal 1 resource from the deactivating pool
   - Weighted by pool reserves
   - Example: Pool has 800 wood, 1200 brick → 60% chance to steal brick
```

### 4. Turn Structure

```
1. Pre-Roll Phase
   - May play ONE development card (except Victory Point)

2. Roll Dice
   - 2-6, 8-12: Generate resources
   - 7: Activate ghost ship (hand limit applies)

3. Trading Phase
   - Unlimited AMM trades
   - Port locations get fee discount

4. Building Phase
   - Build in any order:
     - Roads (1 wood + 1 brick)
     - Settlements (1 wood + 1 brick + 1 sheep + 1 wheat)
     - Cities (3 ore + 2 wheat)
     - Development cards (1 ore + 1 sheep + 1 wheat)

5. Post-Build Phase
   - Play development card if not played pre-roll
```

### 5. Building Rules

#### Costs
```
Road:       1 Wood + 1 Brick
Settlement: 1 Wood + 1 Brick + 1 Sheep + 1 Wheat
City:       3 Ore + 2 Wheat (upgrade settlement)
Dev Card:   1 Ore + 1 Sheep + 1 Wheat
```

#### Placement Rules
- Roads: Must connect to player's network
- Settlements: 2-vertex minimum distance rule
- Cities: Must upgrade existing settlement
- Initial placement: Snake draft (1-2-3-4-4-3-2-1)

### 6. Development Cards

#### Distribution (25 total)
```
14 Knights
5  Victory Points
2  Road Building
2  Year of Plenty  
2  Monopoly
```

#### Effects
- **Knight**: Move ghost ship + contribute to Largest Army
- **Victory Point**: Hidden 1 VP (can be played anytime)
- **Road Building**: Build 2 roads for free
- **Year of Plenty**: Take any 2 resources from bank
- **Monopoly**: All players give you all of one resource type

### 7. Victory Conditions

#### Victory Points
```
Settlement:    1 VP
City:          2 VP
Victory Card:  1 VP
Longest Road:  2 VP (minimum 5 continuous roads)
Largest Army:  2 VP (minimum 3 knights played)
```

#### Game End
- First player to 10 VP wins immediately
- No maximum turn limit

### 8. Special Rules

#### Hand Limit (on 7)
- Players with 8+ cards must discard half (round down)
- Discarded resources return to bank (not AMM pools)

#### Gold Hex
- When rolled, each adjacent player chooses 1 resource

#### Port Control
- Having a settlement/city at port grants fee discount
- Multiple players can benefit from same port

#### Market Dynamics
- Prices update in real-time after each trade
- Price history visible to all players
- Arbitrage opportunities between connected markets

### 9. Strategic Considerations

#### New Strategic Elements
1. **Market Timing**: Buy low, sell high across different pools
2. **Port Control**: Secure fee advantages for frequent traders
3. **Market Manipulation**: Large trades can shift prices
4. **Ghost Ship Economics**: Flipping ports disrupts market access
5. **Resource Hoarding**: Affects both market prices and steal probabilities

#### Balancing Factors
- Fee structure prevents infinite arbitrage loops
- Missing market creates scarcity and strategic port flipping
- Ghost ship dual function balances blocking vs market disruption
- Initial pool size (1000 each) provides adequate liquidity

### 10. Implementation Notes

#### Constants
```javascript
TRADING_FEE = 0.003          // 0.3%
PORT_FEE = 0.0015           // 0.15%
INITIAL_POOL_SIZE = 1000    // Per resource
HAND_LIMIT = 7              // Triggers discard
MIN_LONGEST_ROAD = 5        // For bonus
MIN_LARGEST_ARMY = 3        // For bonus
VICTORY_POINTS_TO_WIN = 10  // Game end condition
```

#### Data Structures
```javascript
// Market Pool
{
  resourceA: "wood",
  resourceB: "brick",
  reserveA: 1000,
  reserveB: 1000,
  isActive: true,
  portLocation: 3  // Board position
}

// Player State
{
  resources: { wood: 5, brick: 3, ... },
  buildings: { roads: [], settlements: [], cities: [] },
  devCards: { knights: 2, hidden: ["victory", "monopoly"] },
  victoryPoints: { public: 6, hidden: 1 }
}
```

This specification provides a complete blueprint for implementing CATAMM with balanced mechanics that create emergent gameplay through dynamic markets while preserving the core Catan experience.