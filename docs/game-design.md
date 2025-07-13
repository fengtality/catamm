# CATAMM Game Design Document

## Board Design Mathematics

### Hexagonal Grid Structure
Standard Catan board layout:
- **19 hexes** arranged in rows of 3-4-5-4-3
- **9 ports** evenly distributed around the perimeter
- **54 vertices** (settlement/city locations)
- **72 edges** (road locations)

### Resource Distribution
- 4 Wood hexes
- 3 Brick hexes  
- 4 Sheep hexes
- 3 Ore hexes
- 4 Wheat hexes
- 1 Desert hex (no resource)

### Number Token Distribution
- One each of: 2, 12
- Two each of: 3, 4, 5, 6, 8, 9, 10, 11
- Zero of: 7 (ghost ship activation)

## Board Layout

The CATAMM board follows the standard Settlers of Catan hexagonal layout with 19 tiles arranged in a 3-4-5-4-3 pattern. See the generated board visualization (catamm_board_layout.png) for the exact layout.

### Visual Board Structure
- **19 hexes total** in hexagonal shape
- **Standard 3-4-5-4-3 arrangement**:
  - Row 1 (top): 3 hexes
  - Row 2: 4 hexes
  - Row 3 (middle): 5 hexes
  - Row 4: 4 hexes
  - Row 5 (bottom): 3 hexes

### Port/AMM Placement
9 ports distributed around the board perimeter:
- Each port represents one AMM market
- Ports are placed at edges/corners of the hexagonal board
- One market is randomly inactive at game start

### Port Distribution
Ports are placed at specific tile locations:
- **Tile 0** (top-left): Variable market
- **Tile 1** (top): Variable market
- **Tile 6** (top-right): Variable market
- **Tile 11** (right): Variable market
- **Tile 15** (bottom-right): Variable market
- **Tile 17** (bottom): Variable market
- **Tile 16** (bottom-left): Variable market
- **Tile 12** (left): Variable market
- **Tile 3** (left): Variable market

Markets are randomly assigned to ports at game start.

## Core Game Mechanics

### Market System
**10 Resource Pair Markets** (all combinations of 5 resources):
1. Wood-Brick (W-B)
2. Wood-Sheep (W-S)
3. Wood-Ore (W-O)
4. Wood-Wheat (W-W) - *Missing at game start*
5. Brick-Sheep (B-S)
6. Brick-Ore (B-O)
7. Brick-Wheat (B-W)
8. Sheep-Ore (S-O)
9. Sheep-Wheat (S-W)
10. Ore-Wheat (O-W)

**Initial State**: 
- 9 ports active (one market randomly missing)
- Each active market has 1000 of each resource in its pool
- Constant product formula: x × y = k

### Ghost Ship Mechanics (Rolling 7 or Playing Knight)

When activated, player chooses ONE of two actions:

#### Option 1: Block Hex
- Move ghost ship to any hex
- Hex produces no resources while blocked
- Steal 1 resource from a player on that hex
- **Weighted stealing**: If target has 5 wood, 3 brick, 2 wheat, probability of stealing wood = 5/10

#### Option 2: Flip Port Market
- Select any port to flip to the missing market
- The current market at that port becomes the new missing market
- Steal 1 resource from the AMM pool being deactivated
- **Weighted stealing**: If pool has 800 wood, 1200 brick, probability of stealing brick = 1200/2000

### AMM Trading Mechanics

**Price Formula**:
```
Output = (Reserve_out × Input) / (Reserve_in + Input)
Price = Reserve_out / Reserve_in
```

**Trading Fees**:
- **Own a port settlement/city**: 0% fee (free trading)
- **No port ownership**: 10% fee on swaps
- **Liquidity withdrawal**: 10% fee if you don't own the port

**Example Trade**:
- Pool: 1000 Wood, 1000 Brick
- Trade: 10 Wood for Brick
- Without port: 10 × 0.10 = 1 Wood fee (actual input = 9 Wood)
- With port: No fee (actual input = 10 Wood)
- Output (no port): (1000 × 9) / (1000 + 9) = 8.92 Brick
- Output (with port): (1000 × 10) / (1000 + 10) = 9.90 Brick

### Turn Structure

1. **Roll Dice** (or play development card first)
   - If 7: Activate ghost ship
   - Else: Distribute resources

2. **Trading Phase** (unlimited)
   - Trade via AMM at any time
   - Port trading has reduced fees

3. **Building Phase**
   - Roads: 1 Wood + 1 Brick
   - Settlements: 1 Wood + 1 Brick + 1 Sheep + 1 Wheat
   - Cities: 3 Ore + 2 Wheat
   - Development Cards: 1 Ore + 1 Sheep + 1 Wheat

4. **Development Card** (if not played before rolling)

### Victory Conditions
- **10 Victory Points** to win
- Settlement: 1 VP
- City: 2 VP
- Longest Road: 2 VP (minimum 5 segments)
- Largest Army: 2 VP (minimum 3 knights)
- Victory Point Cards: 1 VP each

### Special Rules


**Hand Limit**: When 7 is rolled, players with 8+ cards discard half (rounded down)

**Initial Placement**: 
- Snake draft: 1-2-3-4-4-3-2-1
- Each player places settlement + road
- Second settlement produces starting resources

**Market Dynamics**:
- Prices fluctuate based on supply/demand
- Arbitrage opportunities between markets
- Strategic port control becomes crucial