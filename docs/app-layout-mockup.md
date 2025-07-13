# CATAMM App Layout Mockup

## Current Layout Structure

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                    HEADER (h-16)                                       │
│ ┌─────────────────────────┐                          ┌─────────────────────────────┐  │
│ │ CATAMM  Catan + AMM     │                          │ [☾] [⚙▼] Connect 🔗       │  │
│ └─────────────────────────┘                          └─────────────────────────────┘  │
├─────────────────────────────┬─────────────────────────────────┬───────────────────────┤
│      LEFT SIDEBAR (w-96)    │    MAIN BOARD AREA (flex-1)    │  RIGHT SIDEBAR (w-80) │
│                             │        min-w-[800px]           │                       │
│ ┌─────────────────────────┐ │ ┌─────────────────────────────┐ │                       │
│ │       Game Info         │ │ │                             │ │                       │
│ │  ┌─────────────────┐    │ │ │                             │ │                       │
│ │  │ Turn: 1         │    │ │ │                             │ │                       │
│ │  │ Player: 1       │    │ │ │      BOARD CANVAS           │ │                       │
│ │  │ Phase: Setup    │    │ │ │                             │ │                       │
│ │  └─────────────────┘    │ │ │    (Pannable Area)          │ │                       │
│ └─────────────────────────┘ │ │                             │ │                       │
│                             │ │     3000x3000 canvas        │ │                       │
│                             │ │                             │ │                       │
│                             │ │    37 hexes (3 rings)       │ │ ┌───────────────────┐ │
│ ┌─────────────────────────┐ │ │                             │ │ │   Leaderboard     │ │
│ │      Game Log           │ │ │                             │ │ │                   │ │
│ │  ┌─────────────────┐    │ │ └─────────────────────────────┘ │ │ 1. Player 1 - 7VP │ │
│ │  │ [9:41:43 AM]    │    │ │                                 │ │ ▓▓▓▓▓▓▓░░░ 70%   │ │
│ │  │ New board       │    │ │ ┌─────────────────────────────┐ │ │ S:3 C:1 LA:2 LR:0 │ │
│ │  │ generated with  │    │ │ │     Selection Info          │ │ │                   │ │
│ │  │ 37 hexes        │    │ │ │                             │ │ │ 2. Player 2 - 5VP │ │
│ │  │                 │    │ │ │  Portable Vertex V23        │ │ │ ▓▓▓▓▓░░░░░ 50%   │ │
│ │  │ (scrollable)    │    │ │ │  AMM: Wood/Brick (Active)   │ │ │ S:3 C:1 LA:0 LR:0 │ │
│ │  └─────────────────┘    │ │ │  Liquidity: 100/150         │ │ │                   │ │
│ └─────────────────────────┘ │ │  Owner: Player 2            │ │ │ 3. Player 3 - 4VP │ │
│                             │ └─────────────────────────────┘ │ │ ▓▓▓▓░░░░░░ 40%   │ │
│ ┌─────────────────────────┐ │                                 │ │ S:2 C:1 LA:0 LR:0 │ │
│ │    Command Input        │ │                                 │ │                   │ │
│ │  ┌─────────────────┐    │ │                                 │ │ 4. Player 4 - 2VP │ │
│ │  │ > build settle..|    │ │                                 │ │ ▓▓░░░░░░░░ 20%   │ │
│ │  └─────────────────┘    │ │                                 │ │ S:2 C:0 LA:0 LR:0 │ │
│ │    [🏠][💱][✓]          │ │                                 │ └───────────────────┘ │
│ └─────────────────────────┘ │                                 │                       │
│                             │                                 │ ┌───────────────────┐ │
│                             │                                 │ │ Player Resources  │ │
│                             │                                 │ │                   │ │
│                             │                                 │ │ Wood: 3           │ │
│                             │                                 │ │ Brick: 2          │ │
│                             │                                 │ │ Sheep: 4          │ │
│                             │                                 │ │ Wheat: 1          │ │
│                             │                                 │ │ Ore: 0            │ │
│                             │                                 │ └───────────────────┘ │
│ └─────────────────────────┘ │                                 │                       │
└─────────────────────────────┴─────────────────────────────────┴───────────────────────┘
```

## Component Breakdown

### Header (64px height)
- **Left**: Logo and app name
- **Right**: Right-aligned controls:
  - Dark mode toggle button [☾]
  - Settings dropdown [⚙▼] containing:
    - Show Vertices checkbox
    - Show Numbers checkbox
    - Show Portable checkbox
    - Board size selector
    - New Board button
    - Center View button
  - Connect button (for Solana wallet connection)

### Left Sidebar (384px width)
1. **Game Info** (top)
   - Turn number
   - Current player
   - Game phase (Setup/Play/End)

2. **Game Log** (flex-1)
   - Scrollable activity log
   - Timestamp + message format
   - Color-coded by type (action/discovery/system/command)

3. **Command Input** (fixed bottom)
   - Text input field with autocomplete
   - Shows "> " prompt
   - 3 small icon quick action buttons below:
     - 🏠 Build (tooltip: "Build Settlement/City")
     - 💱 Trade (tooltip: "Trade Resources")
     - ✓ End Turn (tooltip: "End Turn")

### Main Board Area (flex-1, min-width: 800px)
1. **Board Canvas** (flex-1)
   - 3000x3000px fixed canvas size
   - Scales to fit container
   - Pannable with mouse drag
   - Click detection for elements

2. **Selection Info** (fixed bottom)
   - Shows details of selected hex/vertex/edge
   - Dynamic content based on selection
   - When portable vertex selected, shows AMM market info:
     - Market pair and status (Active/Inactive)
     - Current liquidity
     - Port owner
   - Horizontal layout for compact display

### Right Sidebar (320px width)
1. **Leaderboard** (top)
   - Players ranked by Victory Points
   - Progress bar showing VP percentage (out of 10)
   - VP breakdown: S (settlements), C (cities), LA (largest army), LR (longest road)

2. **Player Resources** (bottom)
   - Current player's resource counts
   - Wood, Brick, Sheep, Wheat, Ore

## Responsive Behavior
- Minimum window width triggers horizontal scroll
- Board area has min-width of 800px
- Sidebars have fixed widths
- Canvas scales while maintaining aspect ratio

## Color Scheme
- Using mono theme with OKLCH colors
- Background: var(--background)
- Sidebars: var(--sidebar)
- Borders: var(--border)
- Text: var(--foreground) with Geist Mono font
- Selected elements: var(--primary)
- Resource colors: As defined in RESOURCE_COLORS

## Key Changes from Previous Layout
1. **Quick Actions**: Moved from right sidebar to below command input as 3 icon buttons
2. **Selection Info**: Moved from left sidebar to bottom of main board area, shows AMM info for portable vertices
3. **Settings**: Moved to dropdown in header navbar, contains all view options and board controls
4. **Dark Mode**: Toggle button in header next to settings dropdown
5. **Game Info**: Moved from header center to top of left sidebar
6. **Connect Button**: In header for wallet connection
7. **Command Input**: Now includes autocomplete and icon quick actions below
8. **Leaderboard**: Shows VP rankings with progress bars in right sidebar
9. **Player Resources**: Added back below leaderboard in right sidebar
10. **AMM Markets**: Removed from sidebar, now shown in Selection Info when portable vertex selected
11. **Canvas Size**: Increased from 2000x2000 to 3000x3000 pixels