// Complete demonstration of Goldberg CATAMM gameplay
// Shows full game flow from setup to victory

import {
  initializeGame,
  rollDice,
  Pentagon,
  FaceType,
  calculateVictoryPoints,
  checkWinCondition,
  tradeWithAMM,
  activatePentagon
} from './goldberg-game';
import {
  executeSetupPhase
} from './goldberg-setup';
import {
  buildSettlement,
  buildRoad,
  buildCity
} from './goldberg-building';
import { Resource } from '@/types';

function showBoardState(game: any): void {
  console.log('\n🌐 BOARD STATE:');
  
  const hexCount = Array.from(game.faces.values()).filter(f => f.type === FaceType.Hexagon).length;
  const pentCount = Array.from(game.faces.values()).filter(f => f.type === FaceType.Pentagon).length;
  const activePents = Array.from(game.faces.values()).filter(f => 
    f.type === FaceType.Pentagon && (f as Pentagon).port
  ).length;
  
  console.log(`Hexagons: ${hexCount} (${game.discoveredHexagons}/180 discovered)`);
  console.log(`Pentagons: ${pentCount} (${activePents}/12 activated)`);
  console.log(`Total settlements: ${Array.from(game.vertices.values()).filter(v => v.building).length}`);
  console.log(`Total roads: ${Array.from(game.edges.values()).filter(e => e.road).length}`);
}

function showPlayerStatus(game: any): void {
  console.log('\n👥 PLAYER STATUS:');
  
  for (let i = 1; i <= game.players.size; i++) {
    const player = game.players.get(i)!;
    const vp = calculateVictoryPoints(game, i);
    
    console.log(`\nPlayer ${i}: ${vp} VP`);
    console.log(`  SOL: ${player.sol}`);
    console.log(`  Resources:`, Object.entries(player.resources)
      .filter(([_, amt]) => amt > 0)
      .map(([res, amt]) => `${res}: ${amt}`)
      .join(', ') || 'none');
    
    if (player.victoryPoints.longestRoad) console.log(`  🛤️ Longest Road`);
    if (player.victoryPoints.largestArmy) console.log(`  ⚔️ Largest Army`);
    if (player.victoryPoints.firstPort) console.log(`  ⚓ First Port`);
  }
}

function runCompleteGameDemo() {
  console.log('=== 🌍 GOLDBERG CATAMM - COMPLETE GAME DEMO ===\n');
  
  // Initialize 4-player game
  const game = initializeGame(4);
  
  console.log('📋 GAME RULES:');
  console.log('- Start with 19 hexagons in standard Catan layout');
  console.log('- 12 pentagon ports positioned around the sphere');
  console.log('- First to 10 VP wins');
  console.log('- Expand the sphere by building on edges');
  console.log('- Activate pentagon ports for AMM trading\n');
  
  showBoardState(game);
  
  // SETUP PHASE
  console.log('\n═══ SETUP PHASE ═══');
  executeSetupPhase(game);
  showPlayerStatus(game);
  
  // EARLY GAME - Turns 1-10
  console.log('\n\n═══ EARLY GAME (Turns 1-10) ═══');
  console.log('Players establish their initial economies\n');
  
  for (let turn = 1; turn <= 10; turn++) {
    const player = ((turn - 1) % 4) + 1;
    game.currentPlayer = player;
    game.turn = turn;
    
    console.log(`\n--- Turn ${turn} - Player ${player} ---`);
    
    // Roll dice
    const [d1, d2] = rollDice(game);
    const sum = d1 + d2;
    console.log(`Rolled: [${d1}, ${d2}] = ${sum}`);
    
    if (sum === 7) {
      console.log('🦹 Robber activated!');
      // In real game, player would move robber and steal
    }
    
    // Simulate some building (simplified)
    if (turn === 5 && player === 1) {
      // Player 1 discovers a pentagon
      simulatePentagonDiscovery(game, 1);
    }
    
    if (turn === 8 && player === 2) {
      // Player 2 upgrades to city
      const settlements = Array.from(game.vertices.values())
        .filter(v => v.building?.player === 2 && v.building.type === 'settlement');
      if (settlements.length > 0) {
        buildCity(game, settlements[0].id, 2);
        console.log('Player 2 upgraded settlement to city!');
      }
    }
  }
  
  showBoardState(game);
  showPlayerStatus(game);
  
  // MID GAME - Pentagon activation and trading
  console.log('\n\n═══ MID GAME - PENTAGON TRADING ═══');
  
  // Simulate pentagon trading
  const activePentagon = Array.from(game.faces.values())
    .find(f => f.type === FaceType.Pentagon && (f as Pentagon).port) as Pentagon;
  
  if (activePentagon) {
    console.log(`\n💱 AMM Trading at Pentagon ${activePentagon.id}:`);
    console.log(`Resources: ${activePentagon.port!.resource1} <-> ${activePentagon.port!.resource2}`);
    
    // Give player 2 some resources to trade
    const player2 = game.players.get(2)!;
    player2.resources[activePentagon.port!.resource1] = 5;
    
    console.log(`\nPlayer 2 trades 3 ${activePentagon.port!.resource1} for SOL`);
    const tradeResult = tradeWithAMM(
      game,
      activePentagon.id,
      2,
      activePentagon.port!.resource1,
      3,
      false
    );
    
    if (tradeResult) {
      console.log(`Received: ${tradeResult.outputAmount} ${tradeResult.outputResource}`);
      console.log(`AMM Pool now has:`);
      console.log(`  ${activePentagon.port!.resource1}: ${activePentagon.port!.pool.resource1Amount}`);
      console.log(`  ${activePentagon.port!.resource2}: ${activePentagon.port!.pool.resource2Amount}`);
      console.log(`  SOL: ${activePentagon.port!.pool.solAmount}`);
    }
  }
  
  // LATE GAME - Race to victory
  console.log('\n\n═══ LATE GAME - RACE TO VICTORY ═══');
  
  // Simulate endgame state
  game.discoveredHexagons = 45;
  game.activePentagons = 8;
  
  // Give players some victory points
  game.players.get(1)!.victoryPoints.settlements = 3;
  game.players.get(1)!.victoryPoints.cities = 2;
  game.players.get(1)!.victoryPoints.longestRoad = true;
  
  game.players.get(2)!.victoryPoints.settlements = 2;
  game.players.get(2)!.victoryPoints.cities = 3;
  game.players.get(2)!.victoryPoints.firstPort = true;
  
  game.players.get(3)!.victoryPoints.settlements = 4;
  game.players.get(3)!.victoryPoints.cities = 1;
  game.players.get(3)!.victoryPoints.largestArmy = true;
  
  game.players.get(4)!.victoryPoints.settlements = 3;
  game.players.get(4)!.victoryPoints.cities = 2;
  game.players.get(4)!.victoryPoints.hiddenCards = 1;
  
  showBoardState(game);
  showPlayerStatus(game);
  
  // Check for winner
  const winner = checkWinCondition(game);
  if (winner) {
    console.log(`\n🏆 PLAYER ${winner} WINS THE GAME! 🏆`);
  } else {
    console.log('\n⏳ Game continues... (First to 10 VP wins)');
  }
  
  // STRATEGIC INSIGHTS
  console.log('\n\n═══ STRATEGIC INSIGHTS ═══');
  console.log('\n🎯 Key Strategies:');
  console.log('1. EARLY: Secure good resource production near pentagons');
  console.log('2. MID: Race to activate pentagon ports for trading advantage');
  console.log('3. LATE: Control multiple ports to dominate the economy');
  console.log('4. EXPANSION: Discover new tiles to find better resources');
  console.log('5. SPHERE: No corners means infinite expansion possibilities');
  
  console.log('\n💡 Unique Mechanics:');
  console.log('- Pentagon ports create dynamic trading markets');
  console.log('- Sphere topology eliminates position advantage');
  console.log('- Board grows organically through player actions');
  console.log('- AMM pools provide constant liquidity');
  console.log('- Port ownership generates passive income from fees');
}

// Simulate discovering and activating a pentagon
function simulatePentagonDiscovery(game: any, playerId: number): void {
  // Find an unactivated pentagon
  const pentagon = Array.from(game.faces.values())
    .find(f => f.type === FaceType.Pentagon && !(f as Pentagon).port) as Pentagon;
  
  if (pentagon) {
    // Create a vertex near the pentagon
    const vertex = {
      id: `v_pent_${pentagon.id}`,
      position: pentagon.position,
      faces: [pentagon.id],
      building: { type: 'settlement', player: playerId }
    };
    game.vertices.set(vertex.id, vertex);
    game.players.get(playerId)!.victoryPoints.settlements++;
    
    // Activate the pentagon
    activatePentagon(game, pentagon, playerId);
    console.log(`\n⚓ Player ${playerId} discovered and activated Pentagon ${pentagon.id}!`);
    console.log(`   Port trades: ${pentagon.port!.resource1} <-> ${pentagon.port!.resource2}`);
  }
}

// Run the demo
runCompleteGameDemo();