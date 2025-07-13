// Simple demo of Goldberg CATAMM mechanics without full setup

import {
  initializeGame,
  rollDice,
  FaceType,
  Pentagon,
  calculateVictoryPoints,
  tradeWithAMM,
  activatePentagon,
  POLYHEDRON_SIZES
} from './goldberg-game';
import { Resource } from '@/types';

function runSimpleDemo() {
  console.log('=== 🌍 GOLDBERG CATAMM - SIMPLE DEMO ===\n');
  
  // Show available board sizes
  console.log('📏 AVAILABLE BOARD SIZES:');
  Object.entries(POLYHEDRON_SIZES).forEach(([size, config]) => {
    console.log(`  ${size}: ${config.hexagons} hexagons, ${config.deserts} deserts`);
  });
  
  // Initialize game
  console.log('\n🎮 INITIALIZING GAME...');
  const game = initializeGame(4, 'medium');
  
  console.log(`✅ Game initialized with ${game.players.size} players`);
  console.log(`📍 Board size: ${game.polyhedronSize}`);
  console.log(`🎯 Starting hexagons: ${game.discoveredHexagons}`);
  console.log(`⬠ Pentagon ports: ${POLYHEDRON_SIZES[game.polyhedronSize].hexagons + 12} total faces`);
  
  // Show pentagon ports
  console.log('\n⚓ PENTAGON PORTS (visible from start):');
  const pentagons = Array.from(game.faces.values())
    .filter(f => f.type === FaceType.Pentagon) as Pentagon[];
  
  pentagons.slice(0, 6).forEach((pentagon, i) => {
    console.log(`  Pentagon ${i}: ${pentagon.port.resource1} <-> ${pentagon.port.resource2}`);
  });
  console.log(`  ... and ${pentagons.length - 6} more ports`);
  
  // Simulate some dice rolls
  console.log('\n🎲 SIMULATING DICE ROLLS:');
  for (let i = 1; i <= 5; i++) {
    const [d1, d2] = rollDice(game);
    const sum = d1 + d2;
    console.log(`  Turn ${i}: [${d1}][${d2}] = ${sum}${sum === 7 ? ' (Robber!)' : ''}`);
  }
  
  // Demonstrate pentagon activation
  console.log('\n💱 PENTAGON PORT ACTIVATION:');
  const firstPentagon = pentagons[0];
  
  // Simulate a player building on the pentagon
  console.log(`Player 1 builds settlement on Pentagon 0`);
  activatePentagon(game, firstPentagon, 1);
  
  console.log(`✅ Port activated! Trading pair: ${firstPentagon.port.resource1} <-> ${firstPentagon.port.resource2}`);
  console.log(`   Initial liquidity: ${firstPentagon.port.pool.resource1Amount} each resource`);
  
  // Demonstrate trading
  console.log('\n📊 AMM TRADING EXAMPLE:');
  
  // Give player 2 some resources
  const player2 = game.players.get(2)!;
  player2.resources[firstPentagon.port.resource1] = 10;
  
  console.log(`Player 2 resources before trade:`);
  console.log(`  ${firstPentagon.port.resource1}: ${player2.resources[firstPentagon.port.resource1]}`);
  console.log(`  ${firstPentagon.port.resource2}: ${player2.resources[firstPentagon.port.resource2]}`);
  
  // Execute trade
  const tradeAmount = 5;
  console.log(`\nTrading ${tradeAmount} ${firstPentagon.port.resource1} for ${firstPentagon.port.resource2}...`);
  
  const result = tradeWithAMM(
    game,
    firstPentagon.id,
    2,
    firstPentagon.port.resource1,
    tradeAmount
  );
  
  if (result) {
    console.log(`✅ Trade successful! Received ${result.outputAmount} ${result.outputResource}`);
    console.log(`   (5% fee was deducted)`);
    
    console.log(`\nPlayer 2 resources after trade:`);
    console.log(`  ${firstPentagon.port.resource1}: ${player2.resources[firstPentagon.port.resource1]}`);
    console.log(`  ${firstPentagon.port.resource2}: ${player2.resources[firstPentagon.port.resource2]}`);
    
    console.log(`\nAMM Pool state:`);
    console.log(`  ${firstPentagon.port.resource1}: ${firstPentagon.port.pool.resource1Amount.toFixed(1)}`);
    console.log(`  ${firstPentagon.port.resource2}: ${firstPentagon.port.pool.resource2Amount.toFixed(1)}`);
    console.log(`  k (constant): ${firstPentagon.port.pool.k}`);
  }
  
  // Show victory points
  console.log('\n🏆 VICTORY POINTS:');
  for (let i = 1; i <= 4; i++) {
    const vp = calculateVictoryPoints(game, i);
    const player = game.players.get(i)!;
    console.log(`Player ${i}: ${vp} VP ${player.victoryPoints.firstPort ? '(First Port!)' : ''}`);
  }
  
  // Game mechanics summary
  console.log('\n📚 KEY MECHANICS DEMONSTRATED:');
  console.log('1. Pentagon ports are visible from game start');
  console.log('2. Each port trades between two specific resources');
  console.log('3. No currency - direct resource-to-resource swaps');
  console.log('4. AMM uses constant product formula (x * y = k)');
  console.log('5. 5% trading fee (2.5% with city on pentagon)');
  console.log('6. Board can expand up to ' + POLYHEDRON_SIZES[game.polyhedronSize].hexagons + ' hexagons');
  console.log('7. Exactly ' + POLYHEDRON_SIZES[game.polyhedronSize].deserts + ' deserts will appear during expansion');
}

// Run the demo
runSimpleDemo();