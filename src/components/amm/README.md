# AMM Widget System

The AMM (Automated Market Maker) widget system provides a user interface for interacting with the resource trading pools in CATAMM.

## Components

### AMMWidget.tsx
The main AMM interface that appears when:
- A portable vertex (potential AMM port location) is selected on the board
- A player clicks the "Trade" button next to a resource

Features:
- **Swap Tab**: Exchange one resource for another using the AMM formula
- **Deposit Tab**: Add liquidity by depositing both resources in the pool ratio
- **Withdraw Tab**: Remove liquidity (only available to port owners)

The widget displays:
- Current pool reserves
- Exchange rates
- Fee information (0% for owners, 10% for others)
- Real-time swap calculations using the constant product formula (x * y = k)

### ResourcesWithTrade.tsx
An enhanced resource display that shows:
- Total resources across all players
- Current player's resources
- Trade buttons for each resource type

When a trade button is clicked, it triggers the AMM widget to open with an appropriate trading pool.

## Integration

The system is integrated into the RightSidebar component, which conditionally displays either:
- The AMM widget (when a port is selected or trade is initiated)
- The ResourcesWithTrade view (default state)

## Mock Data

Currently using mock data from `src/data/mockAMMData.ts`:
- 10 AMM pools (one for each resource pair)
- 9 ports on the board (one market is always inactive)
- Mock port-to-vertex mapping

## Usage

```tsx
// In RightSidebar.tsx
<AMMWidget
  selectedPort={activePort}
  ammPool={activeAMMPool}
  playerResources={currentPlayerResources}
  isOwner={isPortOwner}
  onSwap={handleSwap}
  onDeposit={handleDeposit}
  onWithdraw={handleWithdraw}
  onClose={() => setSelectedResource(null)}
/>
```

## Future Enhancements

1. Connect to actual game state for real trading
2. Implement proper port-to-vertex mapping
3. Add transaction history
4. Show slippage warnings for large trades
5. Add liquidity provider token tracking