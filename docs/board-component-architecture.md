# Board Component Architecture

## Overview

The board rendering will be split into modular React components that handle different visual elements. These components will use SVG for rendering (better for interactive elements than canvas) and leverage shadcn/ui patterns and the mono theme.

## Component Hierarchy

```
BoardVisualization/
├── BoardSVG (main SVG container with viewBox and pan/zoom)
│   ├── HexGrid (manages hex layout)
│   │   └── HexTile (individual hex component)
│   │       ├── HexShape (polygon with resource color)
│   │       ├── HexNumber (number token)
│   │       └── Robber (robber piece)
│   ├── EdgeLayer (manages all edges)
│   │   ├── Road (placed road with player color)
│   │   └── EdgeInteractive (clickable edge area)
│   ├── VertexLayer (manages all vertices)
│   │   ├── Building (settlement/city)
│   │   ├── PortableVertex (green portable vertices)
│   │   └── VertexInteractive (clickable vertex area)
│   └── SelectionOverlay (highlights for selected elements)
```

## Component Details

### 1. BoardSVG
- Main SVG container with viewBox management
- Handles pan/zoom with mouse events
- Uses CSS variables for theming
- Props: `board`, `viewBox`, `onPan`, `onZoom`

### 2. HexGrid
- Maps over all hexes and renders HexTile components
- Manages hex selection state
- Props: `hexes`, `selectedHex`, `onHexClick`

### 3. HexTile
- Renders individual hex with resource colors from CSS variables
- Shows hex number if enabled
- Handles robber display
- Props: `hex`, `isSelected`, `showNumber`, `onClick`

```tsx
interface HexTileProps {
  hex: Hex
  isSelected: boolean
  showNumber: boolean
  onClick: () => void
}
```

### 4. HexShape
- Pure SVG polygon with resource-based fill
- Uses CSS variables for colors:
  - `--resource-wood`
  - `--resource-brick`
  - `--resource-sheep`
  - `--resource-wheat`
  - `--resource-ore`
  - `--resource-desert`

### 5. HexNumber
- SVG circle with number token
- Red color for 6 and 8 (high probability)
- Uses `--token-*` CSS variables

### 6. EdgeLayer
- Renders all edges (roads and interactive areas)
- Z-index management for proper layering
- Props: `edges`, `roads`, `selectedEdge`, `onEdgeClick`

### 7. Road
- SVG line with player color
- Uses `--player-1` through `--player-4` CSS variables
- Wider stroke with rounded caps

### 8. VertexLayer
- Renders all vertices (buildings and interactive areas)
- Manages portable vertex highlighting
- Props: `vertices`, `buildings`, `portableVertices`, `selectedVertex`, `onVertexClick`

### 9. Building
- Settlement: House-shaped SVG path
- City: Larger building with towers
- Player colors from CSS variables

### 10. PortableVertex
- Green circle for portable vertices
- Larger and brighter when selected
- Uses `--selection-primary` color

## Interaction Patterns

### Click Detection
- Each interactive element has an invisible larger hit area
- Uses pointer-events and cursor styles
- Follows shadcn/ui interaction patterns

### Selection States
- Selected hex: Brighter fill, shadow effect
- Selected edge: Glowing stroke
- Selected vertex: Pulsing animation

### Hover States
- Subtle opacity change on hover
- Cursor changes to pointer
- Tooltip support for additional info

## Theme Integration

All colors use CSS variables from the mono theme:
- Resource colors adapt to dark/light mode
- Player colors have proper contrast
- Selection highlights use accent colors
- Shadows and borders follow theme patterns

## Performance Optimizations

1. **Memoization**: Use React.memo for static elements
2. **Event Delegation**: Single click handler on SVG root
3. **CSS Transforms**: Use transform for animations instead of re-rendering
4. **Viewport Culling**: Only render hexes within viewBox bounds

## State Management

The board components will be purely presentational, receiving all state through props:
- Selection state from parent
- Game state (buildings, roads) from board model
- View options (show numbers, vertices) from settings

## Accessibility

- Proper ARIA labels for interactive elements
- Keyboard navigation support
- High contrast mode compatibility
- Screen reader announcements for actions