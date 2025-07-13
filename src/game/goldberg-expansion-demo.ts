// Demo of sphere expansion mechanics in Goldberg CATAMM

import {
  initializeGame,
  rollDice,
  Pentagon,
  FaceType,
  calculateVictoryPoints
} from './goldberg-game';
import {
  buildSettlement,
  buildRoad,
  buildCity
} from './goldberg-building';

function visualizeSphere(game: any): void {
  console.log('\n🌐 SPHERE STATE:');
  console.log(`Hexagons: ${game.discoveredHexagons}/180`);
  console.log(`Pentagon Ports: ${game.activePentagons}/12`);
  
  // Show rough layout
  const hexCount = Array.from(game.faces.values()).filter(f => f.type === FaceType.Hexagon).length;
  const pentCount = Array.from(game.faces.values()).filter(f => f.type === FaceType.Pentagon).length;
  
  console.log(`\nVisible Faces:`);
  console.log(`⬢ Hexagons: ${hexCount}`);
  console.log(`⬠ Pentagons: ${pentCount}`);
  console.log(`◯ Empty Space: ~${180 - hexCount} potential hexagons`);
}

import { executeSetupPhase } from './goldberg-setup';

function runExpansionDemo() {
  console.log('=== GOLDBERG SPHERE EXPANSION DEMO ===\n');
  
  const game = initializeGame(4);
  
  console.log('📍 INITIAL STATE: Standard 19-hex Catan board with 12 pentagons');
  visualizeSphere(game);
  
  // Execute automated setup phase
  executeSetupPhase(game);
  
  visualizeSphere(game);
  
  // First expansion wave
  console.log('\n🌊 FIRST EXPANSION WAVE - Players discover new tiles:');
  
  // Pentagons are already placed during initialization
  console.log(`\n12 Pentagon ports are positioned equidistantly around the board`);
  console.log(`Players will race to reach and activate these trading hubs`);
  
  // Simulate some expansion moves
  console.log('\n📈 EXPANSION MOVES:');
  
  // Create vertices at expansion points
  const expansionVertex1 = {
    id: 'v_exp_1',
    position: { x: 0.15, y: 0.08, z: 0.97 },
    faces: ['hex_0'], // Will discover more
    building: undefined
  };
  game.vertices.set(expansionVertex1.id, expansionVertex1);
  
  // Connect with roads and build
  game.edges.set('e_exp_1', {
    id: 'e_exp_1',
    vertices: ['v_0_0', 'v_exp_1']
  });
  
  buildRoad(game, 'e_exp_1', 1);
  result = buildSettlement(game, 'v_exp_1', 1);
  console.log(`\nPlayer 1 expands: ${result.message}`);
  if (result.discoveredHexagons) {
    console.log(`  → Discovered hexagons: ${result.discoveredHexagons.join(', ')}`);
  }
  if (result.activatedPentagon) {
    console.log(`  → Activated pentagon port: ${result.activatedPentagon}`);
  }
  
  visualizeSphere(game);
  
  // Simulate resource generation and trading
  console.log('\n💰 RESOURCE GENERATION:');
  for (let turn = 1; turn <= 5; turn++) {
    const [d1, d2] = rollDice(game);
    console.log(`Turn ${turn}: Rolled ${d1 + d2}`);
  }
  
  // Mid-game state
  console.log('\n🎯 MID-GAME STATE:');
  
  // Simulate more expansion
  game.discoveredHexagons = 45;
  game.activePentagons = 3;
  
  // Update some victory points
  game.players.get(1)!.victoryPoints.settlements = 3;
  game.players.get(1)!.victoryPoints.cities = 1;
  game.players.get(1)!.victoryPoints.longestRoad = true;
  
  game.players.get(2)!.victoryPoints.settlements = 2;
  game.players.get(2)!.victoryPoints.cities = 2;
  game.players.get(2)!.victoryPoints.firstPort = true;
  
  visualizeSphere(game);
  
  console.log('\n🏆 VICTORY POINTS:');
  for (let i = 1; i <= 4; i++) {
    const vp = calculateVictoryPoints(game, i);
    const player = game.players.get(i)!;
    console.log(`Player ${i}: ${vp} VP`);
    console.log(`  Settlements: ${player.victoryPoints.settlements}`);
    console.log(`  Cities: ${player.victoryPoints.cities * 2}`);
    if (player.victoryPoints.longestRoad) console.log(`  Longest Road: 2`);
    if (player.victoryPoints.largestArmy) console.log(`  Largest Army: 2`);
    if (player.victoryPoints.firstPort) console.log(`  First Port: 1`);
  }
  
  // Late game projection
  console.log('\n🌅 LATE GAME PROJECTION:');
  game.discoveredHexagons = 120;
  game.activePentagons = 8;
  
  visualizeSphere(game);
  
  console.log('\n💡 STRATEGIC INSIGHTS:');
  console.log('- Early expansion reveals more hexagons and pentagons');
  console.log('- Pentagon ports become trading hubs as resources concentrate');
  console.log('- Late game: Limited expansion space increases conflict');
  console.log('- Sphere topology means no player can be "cornered"');
  console.log('- All 12 pentagons are equidistant - no "better" positions');
  
  console.log('\n🎮 UNIQUE MECHANICS:');
  console.log('1. Dynamic Board: Starts small, grows through exploration');
  console.log('2. Pentagon Ports: Random resource pairs create unique economies');
  console.log('3. Spherical Play: No edges means infinite expansion directions');
  console.log('4. AMM Trading: Automated markets with player-owned liquidity');
  console.log('5. Discovery Risk: Unknown resources until tiles are revealed');
}

// Run the demo
runExpansionDemo();