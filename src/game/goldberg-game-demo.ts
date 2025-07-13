// Demo script to showcase Goldberg CATAMM game mechanics

import {
  initializeGame,
  rollDice,
  discoverHexagon,
  activatePentagon,
  tradeWithAMM,
  calculateVictoryPoints,
  checkWinCondition,
  BuildingType,
  FaceType,
  Pentagon,
  Hexagon
} from './goldberg-game';
import { Resource } from '@/types';

function runGameDemo() {
  console.log('=== GOLDBERG CATAMM GAME DEMO ===\n');
  
  // Initialize 4-player game
  const game = initializeGame(4);
  console.log('Game initialized with 4 players');
  console.log(`Starting hexagon: ${game.discoveredHexagons}`);
  console.log(`Each player starts with ${game.players.get(1)!.sol} SOL\n`);

  // Simulate setup phase - each player places initial settlement
  console.log('--- SETUP PHASE ---');
  
  // Player 1 builds on vertex of starting hex
  const startVertex = game.vertices.get('v_0_0')!;
  startVertex.building = { type: BuildingType.Settlement, player: 1 };
  game.players.get(1)!.victoryPoints.settlements = 1;
  console.log('Player 1 builds settlement on starting hex');

  // Simulate discovering new tiles as players expand
  console.log('\n--- EXPANSION PHASE ---');
  
  // Discover adjacent hexagons
  const positions = [
    { x: 0.1, y: 0, z: 0.99 },
    { x: -0.05, y: 0.087, z: 0.99 },
    { x: -0.05, y: -0.087, z: 0.99 }
  ];
  
  positions.forEach((pos, i) => {
    const newHex = discoverHexagon(game, pos);
    if (newHex) {
      console.log(`Discovered hex ${i + 1}: ${newHex.resource || 'Desert'} (${newHex.numberToken || 'None'})`);
    }
  });

  // Create a pentagon for trading
  console.log('\n--- PENTAGON ACTIVATION ---');
  const pentagon: Pentagon = {
    id: 'pent_0',
    type: FaceType.Pentagon,
    position: { x: 0.15, y: 0.15, z: 0.97 },
    neighbors: ['hex_0', 'hex_1', 'hex_2'],
  };
  game.faces.set(pentagon.id, pentagon);

  // Player 2 builds on pentagon and activates it
  const pentVertex = {
    id: 'v_pent_0',
    position: pentagon.position,
    faces: [pentagon.id, 'hex_0', 'hex_1'],
    building: { type: BuildingType.Settlement, player: 2 }
  };
  game.vertices.set(pentVertex.id, pentVertex);
  game.players.get(2)!.victoryPoints.settlements = 1;
  
  activatePentagon(game, pentagon, 2);
  console.log(`Player 2 activated pentagon port!`);
  console.log(`Port trades between: ${pentagon.port?.resource1} <-> ${pentagon.port?.resource2}`);
  console.log(`Player 2 earned first port bonus!`);

  // Simulate some dice rolls and resource generation
  console.log('\n--- RESOURCE GENERATION ---');
  
  // Give players some resources for testing
  game.players.get(1)!.resources[Resource.Wood] = 5;
  game.players.get(1)!.resources[Resource.Brick] = 3;
  game.players.get(2)!.resources[Resource.Wheat] = 4;
  game.players.get(3)!.resources[Resource.Ore] = 6;
  
  for (let i = 0; i < 5; i++) {
    const [die1, die2] = rollDice(game);
    const sum = die1 + die2;
    console.log(`Roll ${i + 1}: [${die1}, ${die2}] = ${sum}`);
    
    if (sum === 7) {
      console.log('  -> Robber activated!');
    }
  }

  // Test AMM trading
  console.log('\n--- AMM TRADING ---');
  
  if (pentagon.port) {
    const player1 = game.players.get(1)!;
    console.log(`\nPlayer 1 resources before trade:`);
    console.log(`  ${pentagon.port.resource1}: ${player1.resources[pentagon.port.resource1]}`);
    console.log(`  SOL: ${player1.sol}`);
    
    // Try to trade resource for SOL
    const inputResource = pentagon.port.resource1;
    const inputAmount = 2;
    
    if (player1.resources[inputResource] >= inputAmount) {
      const result = tradeWithAMM(game, pentagon.id, 1, inputResource, inputAmount, false);
      
      if (result) {
        console.log(`\nTraded ${inputAmount} ${inputResource} for ${result.outputAmount} ${result.outputResource}`);
        console.log(`Player 1 after trade:`);
        console.log(`  ${inputResource}: ${player1.resources[inputResource]}`);
        console.log(`  SOL: ${player1.sol}`);
        console.log(`\nAMM Pool state:`);
        console.log(`  ${pentagon.port.resource1}: ${pentagon.port.pool.resource1Amount}`);
        console.log(`  ${pentagon.port.resource2}: ${pentagon.port.pool.resource2Amount}`);
        console.log(`  SOL: ${pentagon.port.pool.solAmount}`);
        console.log(`  Total fees collected: ${pentagon.port.pool.totalFees}`);
      }
    }
  }

  // Check victory points
  console.log('\n--- VICTORY POINTS ---');
  for (let i = 1; i <= 4; i++) {
    const vp = calculateVictoryPoints(game, i);
    console.log(`Player ${i}: ${vp} victory points`);
  }

  const winner = checkWinCondition(game);
  if (winner) {
    console.log(`\nPlayer ${winner} wins!`);
  } else {
    console.log(`\nNo winner yet (need 10 VP to win)`);
  }

  // Show final board state
  console.log('\n--- FINAL BOARD STATE ---');
  console.log(`Total discovered hexagons: ${game.discoveredHexagons}`);
  console.log(`Active pentagon ports: ${game.activePentagons}`);
  console.log(`Total faces on board: ${game.faces.size}`);
}

// Run the demo
runGameDemo();