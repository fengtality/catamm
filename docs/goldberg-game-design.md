# Goldberg Polyhedron CATAMM Game Design

## Core Concept
A Catan-style game played on a Goldberg polyhedron GP(1,4) sphere with 12 pentagons serving as AMM trading ports and expandable hexagon tiles for resources.

## Game Structure

### Board Topology
- **Goldberg Polyhedron GP(1,4)**: Spherical board with no edges
- **12 Pentagon Ports**: Fixed positions based on icosahedral symmetry
- **Hexagon Tiles**: Start with 1, expand as players explore
- **Maximum**: 180 hexagons (full GP(1,4) has 192 faces total)

### Initial State
- **Starting Board**: 19 hexagons in standard Catan configuration
- **Resources**: Standard Catan distribution (4 wood, 3 brick, 4 sheep, 4 wheat, 3 ore, 1 desert)
- **Players**: Minimum 4 players, each starts with 1000 SOL
- **Setup Phase**: Each player places 2 settlements and 2 roads
- **Pentagon Placement**: 12 pentagons positioned equidistantly around the starting cluster
- **AMM Pools**: No initial pools - created when pentagons are activated

## Game Mechanics

### Tile Discovery
- When a player builds on a vertex that borders unexplored space
- New hexagon tile is generated with:
  - Random resource type (not including desert)
  - Number token (2-12, excluding 7)
  - Connects to existing board seamlessly

### Pentagon Ports (AMM Trading)
- **Activation**: First player to build settlement on pentagon vertex
- **Trading Pair**: Randomly selects 2 of the 5 adjacent hexagon resources
- **AMM Pool**: Initialized with 100 SOL and 100 of each resource
- **Trading Fee**: 5% on all trades
- **Formula**: Constant product AMM (x * y = k)

### Building Rules
- **Settlements**: 
  - Can be placed on any vertex with no adjacent settlements
  - On pentagon vertices: Activates port if first settler
  - On edge vertices: May trigger tile discovery
  - Generates resources from up to 3 adjacent hexes
  
- **Cities**: 
  - Upgrade from settlements
  - Double resource generation
  - On pentagon vertices: Reduces trading fees to 2.5%

- **Roads**:
  - Connect settlements/cities
  - Required for expansion
  - Longest road bonus: 2 victory points

### Resource Generation
- **Dice Roll**: 2d6 determines which hexes produce
- **7 Roll**: Activates robber (blocks one hex)
- **Distribution**: Adjacent settlements/cities collect resources

### Victory Conditions
- **Victory Points Required**: 10 (adjustable)
- **Point Sources**:
  - Settlement: 1 point
  - City: 2 points
  - Longest Road: 2 points
  - Largest Army: 2 points (most knight cards played)
  - Special Achievements:
    - First Pentagon Port: 1 point
    - Most Profitable Port Owner: 1 point

### Development Cards
- **Knight**: Move robber, steal resource
- **Victory Point**: Hidden 1 VP
- **Road Building**: Place 2 roads free
- **Discovery**: Trigger new tile placement
- **Monopoly**: Take all of one resource from players

## AMM Trading Mechanics

### Pool Dynamics
- Each pentagon maintains separate pools for its 2 resources
- Players can:
  - Swap resources through the pool
  - Add liquidity (earn fees proportionally)
  - Remove liquidity

### Fee Distribution
- 5% fee on all trades (2.5% with city)
- Fees distributed to:
  - 50% to liquidity providers
  - 25% to port owner (first settler)
  - 25% burned (removed from game)

## Expansion Strategy

### Sphere Growth Pattern
- Start: 1 hex surrounded by empty space
- Early: Players expand outward, discovering tiles
- Mid: Multiple expansion fronts meet
- Late: Final tiles fill gaps, pentagons become crucial

### Pentagon Scarcity
- Only 12 pentagons on entire sphere
- Strategic value increases as board fills
- Late-game pentagon control often determines winner

## Economic Balance

### Resource Scarcity
- Limited tiles mean finite resources
- AMM pools provide liquidity but at a cost
- Strategic trading becomes crucial

### SOL Economy
- Fixed starting amount per player
- Can be earned through:
  - AMM fee collection
  - Trading profits
  - Special development cards
- Spent on:
  - AMM trading
  - Development cards
  - Building costs (optional variant)

## Game End Triggers
1. **Victory Point Threshold**: First to 10 VP
2. **Board Completion**: All 180 hexagons discovered (rare)
3. **Economic Victory**: Control 75% of all AMM liquidity
4. **Time Limit**: Most VP after X rounds

## Unique Strategic Elements

### Spatial Strategy
- No edges means no "corner" positions
- Expansion can go any direction
- Pentagon positions become natural chokepoints

### Economic Strategy
- Early pentagon control provides fee income
- Liquidity provision as investment strategy
- Resource monopolies through AMM manipulation

### Discovery Strategy
- Control expansion to favorable resource clusters
- Block opponents from reaching pentagons
- Create resource deserts for opponents

## Implementation Notes

### Coordinate System
- Use spherical coordinates for face centers
- Vertices shared between faces use geodesic distance
- Neighbor detection based on proximity threshold

### Procedural Generation
- Hexagon resources follow balanced distribution
- Number tokens follow probability curve
- Pentagon placement follows icosahedral symmetry

### UI Considerations
- 3D rotating sphere view
- Face selection and highlighting
- Trade interface for AMM interactions
- Resource/SOL display for all players