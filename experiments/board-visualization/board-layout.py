import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import RegularPolygon, Rectangle, FancyBboxPatch
import numpy as np

# Create figure with UI layout
fig = plt.figure(figsize=(16, 10))

# Define the three panels
left_panel = plt.subplot2grid((1, 3), (0, 0), colspan=1)
center_panel = plt.subplot2grid((1, 3), (0, 1), colspan=1)
right_panel = plt.subplot2grid((1, 3), (0, 2), colspan=1)

# Colors
bg_color = '#1a1a1a'
panel_color = '#2a2a2a'
text_color = '#ffffff'
hex_colors = {
    'wood': '#228B22',
    'brick': '#B22222',
    'sheep': '#90EE90',
    'wheat': '#FFD700',
    'ore': '#696969',
    'desert': '#DEB887'
}
port_color = '#4169E1'
port_text_color = '#FFFFFF'

# Set figure background
fig.patch.set_facecolor(bg_color)

# LEFT PANEL - Game Info & Log
left_panel.set_xlim(0, 10)
left_panel.set_ylim(0, 10)
left_panel.set_facecolor(panel_color)
left_panel.axis('off')

# Game Info Section
left_panel.text(5, 9.5, 'GAME INFO', ha='center', va='top', fontsize=14, fontweight='bold', color=text_color)
left_panel.text(0.5, 8.8, 'Turn: Player 1', fontsize=10, color=text_color)
left_panel.text(0.5, 8.3, 'Round: 5', fontsize=10, color=text_color)
left_panel.text(0.5, 7.8, 'Dice: 7', fontsize=10, color=text_color)
left_panel.text(0.5, 7.3, 'Ghost Ship Active', fontsize=10, color='#FF6B6B')
left_panel.text(0.5, 6.8, 'Longest Road: P2 (5)', fontsize=10, color=text_color)
left_panel.text(0.5, 6.3, 'Largest Army: P3 (3)', fontsize=10, color=text_color)

# Game Log Section
left_panel.text(5, 5.5, 'GAME LOG', ha='center', va='top', fontsize=14, fontweight='bold', color=text_color)
log_entries = [
    '[12:01] P1 rolled 7 - Ghost ship!',
    '[12:00] P2 swapped 3 wood for 2 brick',
    '[11:59] P3 played knight',
    '[11:58] P1 deposited liquidity W-B',
    '[11:57] P4 built settlement',
    '[11:56] P2 rolled 6',
    '[11:55] Resources distributed'
]
for i, entry in enumerate(log_entries):
    left_panel.text(0.5, 4.8 - i*0.4, entry, fontsize=8, color=text_color)

# CENTER PANEL - Game Board
center_panel.set_xlim(-4, 4)
center_panel.set_ylim(-4, 4)
center_panel.set_facecolor(panel_color)
center_panel.axis('off')

# Title
center_panel.text(0, 3.5, 'CATAMM BOARD', ha='center', va='top', fontsize=16, fontweight='bold', color=text_color)

# Hexagon layout (standard Catan 3-4-5-4-3)
hex_size = 0.5
hex_spacing = hex_size * 1.75

# Board configuration (19 hexes)
board_config = [
    # Row 1 (3 hexes)
    [(-1, 2), (0, 2), (1, 2)],
    # Row 2 (4 hexes)
    [(-1.5, 1), (-0.5, 1), (0.5, 1), (1.5, 1)],
    # Row 3 (5 hexes)
    [(-2, 0), (-1, 0), (0, 0), (1, 0), (2, 0)],
    # Row 4 (4 hexes)
    [(-1.5, -1), (-0.5, -1), (0.5, -1), (1.5, -1)],
    # Row 5 (3 hexes)
    [(-1, -2), (0, -2), (1, -2)]
]

# Resource and number distribution
resources = [
    ['brick', 'wood', 'wheat'],
    ['sheep', 'ore', 'brick', 'wood'],
    ['wheat', 'sheep', 'desert', 'ore', 'wood'],
    ['brick', 'wheat', 'sheep', 'ore'],
    ['wood', 'wheat', 'sheep']
]

numbers = [
    [3, 10, 4],
    [5, 8, 11, 6],
    [2, 9, 'X', 3, 12],
    [6, 10, 5, 9],
    [8, 4, 11]
]

# Draw hexagons
for row_idx, row in enumerate(board_config):
    for hex_idx, (x, y) in enumerate(row):
        resource = resources[row_idx][hex_idx]
        number = numbers[row_idx][hex_idx]
        
        # Draw hexagon
        hex_patch = RegularPolygon((x * hex_spacing, y * hex_spacing), 
                                   6, hex_size, 
                                   facecolor=hex_colors[resource], 
                                   edgecolor='black', linewidth=2)
        center_panel.add_patch(hex_patch)
        
        # Add number token (except desert)
        if number != 'X':
            circle = plt.Circle((x * hex_spacing, y * hex_spacing), 0.2, 
                               facecolor='white', edgecolor='black', linewidth=1)
            center_panel.add_patch(circle)
            center_panel.text(x * hex_spacing, y * hex_spacing, str(number), 
                            ha='center', va='center', fontsize=10, fontweight='bold')
        else:
            # Ghost ship on desert
            center_panel.text(x * hex_spacing, y * hex_spacing, '☠', 
                            ha='center', va='center', fontsize=20)

# Port/AMM locations (9 ports around the perimeter)
port_positions = [
    (-1, 2.8, 'W-B'),      # Top left
    (0, 2.8, 'W-S'),       # Top center  
    (1, 2.8, 'W-O'),       # Top right
    (2.5, 0.5, 'B-S'),     # Right upper
    (2.5, -0.5, 'B-O'),    # Right lower
    (1, -2.8, 'B-W'),      # Bottom right
    (0, -2.8, 'S-O'),      # Bottom center
    (-1, -2.8, 'S-W'),     # Bottom left
    (-2.5, 0, 'O-W'),      # Left center
]

# Draw ports/AMMs
for x, y, market in port_positions:
    # Port circle
    port_circle = plt.Circle((x, y), 0.25, facecolor=port_color, 
                           edgecolor='white', linewidth=2)
    center_panel.add_patch(port_circle)
    center_panel.text(x, y, market, ha='center', va='center', 
                    fontsize=8, color=port_text_color, fontweight='bold')

# Add legend
center_panel.text(-3.5, -3.5, 'Port = AMM Market', fontsize=10, color=text_color)
center_panel.text(-3.5, -3.8, 'Own port = 0% fees', fontsize=8, color=text_color)
center_panel.text(-3.5, -4.1, 'No port = 10% swap fee', fontsize=8, color=text_color)

# RIGHT PANEL - Players & AMM Widget
right_panel.set_xlim(0, 10)
right_panel.set_ylim(0, 10)
right_panel.set_facecolor(panel_color)
right_panel.axis('off')

# Players Section
right_panel.text(5, 9.5, 'PLAYERS', ha='center', va='top', fontsize=14, fontweight='bold', color=text_color)

# Player boxes
players = [
    {'name': 'Player 1 [YOU]', 'resources': {'W': 3, 'B': 2, 'S': 5, 'Wh': 1, 'O': 4}, 'vp': 4, 'color': '#FF6B6B'},
    {'name': 'Player 2 [AI]', 'resources': {'W': 2, 'B': 4, 'S': 3, 'Wh': 2, 'O': 1}, 'vp': 5, 'color': '#4ECDC4'},
    {'name': 'Player 3 [AI]', 'resources': 8, 'vp': 6, 'color': '#45B7D1'},
    {'name': 'Player 4 [AI]', 'resources': 7, 'vp': 3, 'color': '#96CEB4'}
]

y_pos = 8.5
for player in players:
    # Player box
    box = FancyBboxPatch((0.5, y_pos - 1.2), 9, 1, boxstyle="round,pad=0.1",
                        facecolor=player['color'], alpha=0.3, edgecolor=player['color'])
    right_panel.add_patch(box)
    
    # Player info
    right_panel.text(1, y_pos - 0.3, player['name'], fontsize=10, color=text_color, fontweight='bold')
    if isinstance(player['resources'], dict):
        res_text = ' '.join([f"{k}:{v}" for k, v in player['resources'].items()])
        right_panel.text(1, y_pos - 0.7, res_text, fontsize=8, color=text_color)
    else:
        right_panel.text(1, y_pos - 0.7, f"Resources: {player['resources']}", fontsize=8, color=text_color)
    right_panel.text(1, y_pos - 1, f"Victory Points: {player['vp']}", fontsize=8, color=text_color)
    
    y_pos -= 1.5

# AMM Widget Section
right_panel.text(5, 4, 'AMM WIDGET', ha='center', va='top', fontsize=14, fontweight='bold', color=text_color)

# Tabs
tabs = ['List', 'Swap', 'Pool', 'Withdraw']
tab_width = 2
for i, tab in enumerate(tabs):
    x = 0.5 + i * tab_width
    if tab == 'Swap':  # Active tab
        tab_box = FancyBboxPatch((x, 3.2), tab_width - 0.1, 0.4, boxstyle="round,pad=0.05",
                               facecolor='#4169E1', edgecolor='white')
    else:
        tab_box = FancyBboxPatch((x, 3.2), tab_width - 0.1, 0.4, boxstyle="round,pad=0.05",
                               facecolor='#3a3a3a', edgecolor='#5a5a5a')
    right_panel.add_patch(tab_box)
    right_panel.text(x + tab_width/2, 3.4, tab, ha='center', va='center', fontsize=9, color=text_color)

# Market prices (List view)
markets = [
    ('W-B', '1.05', '↑'),
    ('W-S', '0.98', '↓'),
    ('W-O', '1.12', '↑'),
    ('B-S', '0.95', '↓'),
    ('B-O', '1.08', '='),
    ('B-W', 'INACTIVE', '-'),
    ('S-O', '1.15', '↑'),
    ('S-W', '1.03', '='),
    ('O-W', '0.97', '↓')
]

right_panel.text(1, 2.8, 'Market', fontsize=10, color=text_color, fontweight='bold')
right_panel.text(4, 2.8, 'Price', fontsize=10, color=text_color, fontweight='bold')
right_panel.text(7, 2.8, 'Trend', fontsize=10, color=text_color, fontweight='bold')

y = 2.4
for market, price, trend in markets:
    color = '#FF6B6B' if price == 'INACTIVE' else text_color
    right_panel.text(1, y, market, fontsize=9, color=color)
    right_panel.text(4, y, price, fontsize=9, color=color)
    
    if trend == '↑':
        trend_color = '#4ECDC4'
    elif trend == '↓':
        trend_color = '#FF6B6B'
    else:
        trend_color = text_color
    
    right_panel.text(7, y, trend, fontsize=9, color=trend_color)
    y -= 0.3

plt.suptitle('CATAMM - Catan with AMM Trading', fontsize=20, fontweight='bold', color=text_color)
plt.tight_layout()
plt.savefig('/Users/feng/Documents/catamm/docs/catamm-board-layout.png', dpi=150, facecolor=bg_color)
plt.close()

print("Board layout image created: docs/catamm-board-layout.png")