// SOL Catamm - Catan with SOL-based AMM Trading
// Fixed version with proper Road Building and Monopoly mechanics

class SOLAMMPool {
    constructor(resource, initialResourceLiquidity = 10, initialSOLLiquidity = 50) {
        this.resource = resource; // wood, brick, sheep, wheat, ore
        this.resourceReserve = initialResourceLiquidity;
        this.solReserve = initialSOLLiquidity; // SOL is the base pair
        this.feeRate = 0.05; // 5% trading fee
    }
    
    // Get resource output for SOL input (buying resources)
    getBuyResourceOutput(solAmountIn) {
        const newSOLReserve = this.solReserve + solAmountIn;
        const newResourceReserve = (this.solReserve * this.resourceReserve) / newSOLReserve;
        const resourceOut = this.resourceReserve - newResourceReserve;
        const fee = resourceOut * this.feeRate;
        return resourceOut - fee;
    }
    
    // Get SOL output for resource input (selling resources)
    getSellResourceOutput(resourceAmountIn) {
        const newResourceReserve = this.resourceReserve + resourceAmountIn;
        const newSOLReserve = (this.solReserve * this.resourceReserve) / newResourceReserve;
        const solOut = this.solReserve - newSOLReserve;
        const fee = solOut * this.feeRate;
        return solOut - fee;
    }
    
    // Execute SOL → Resource trade
    buyResource(solAmountIn) {
        const resourceOut = this.getBuyResourceOutput(solAmountIn);
        this.solReserve += solAmountIn;
        this.resourceReserve -= (resourceOut / (1 - this.feeRate));
        return resourceOut;
    }
    
    // Execute Resource → SOL trade
    sellResource(resourceAmountIn) {
        const solOut = this.getSellResourceOutput(resourceAmountIn);
        this.resourceReserve += resourceAmountIn;
        this.solReserve -= (solOut / (1 - this.feeRate));
        return solOut;
    }
    
    getPrice() {
        return this.solReserve / this.resourceReserve; // SOL per resource
    }
}

class DevelopmentCardDeck {
    constructor() {
        this.cards = [];
        this.initializeDeck();
        this.shuffle();
    }
    
    initializeDeck() {
        // 14 Knight cards
        for (let i = 0; i < 14; i++) {
            this.cards.push({ type: 'knight', name: 'Knight' });
        }
        
        // 5 Victory Point cards
        for (let i = 0; i < 5; i++) {
            this.cards.push({ type: 'victory_point', name: 'Victory Point', vp: 1 });
        }
        
        // 6 Progress cards
        this.cards.push({ type: 'progress', name: 'Road Building', effect: 'road_building' });
        this.cards.push({ type: 'progress', name: 'Road Building', effect: 'road_building' });
        this.cards.push({ type: 'progress', name: 'Year of Plenty', effect: 'year_of_plenty' });
        this.cards.push({ type: 'progress', name: 'Year of Plenty', effect: 'year_of_plenty' });
        this.cards.push({ type: 'progress', name: 'Monopoly', effect: 'monopoly' });
        this.cards.push({ type: 'progress', name: 'Monopoly', effect: 'monopoly' });
    }
    
    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }
    
    drawCard() {
        return this.cards.pop();
    }
    
    isEmpty() {
        return this.cards.length === 0;
    }
}

class Player {
    constructor(id) {
        this.id = id;
        this.sol = 100; // Starting SOL balance
        this.resources = { wood: 0, brick: 0, sheep: 0, wheat: 0, ore: 0 };
        this.buildings = { settlements: 0, cities: 0, roads: 0 };
        this.victoryPoints = 0;
        this.totalSOLSpent = 0;
        this.totalResourcesGenerated = 0;
        
        // Development card related
        this.developmentCards = [];
        this.knightsPlayed = 0;
        this.activeKnights = 0; // NEW: Unlimited knights that can be recruited
        this.newlyBoughtCards = [];
        
        // Catan building limits (knights now unlimited)
        this.maxSettlements = 5;
        this.maxCities = 4;
        this.maxRoads = 15;
        // No maxKnights - unlimited!
    }
    
    getTotalResources() {
        return Object.values(this.resources).reduce((sum, val) => sum + val, 0);
    }
    
    canBuild(buildingType, costs) {
        const cost = costs[buildingType];
        
        // Check building limits
        if (buildingType === 'settlement' && this.buildings.settlements >= this.maxSettlements) {
            return false;
        }
        if (buildingType === 'city' && (this.buildings.cities >= this.maxCities || this.buildings.settlements === 0)) {
            return false;
        }
        if (buildingType === 'road' && this.buildings.roads >= this.maxRoads) {
            return false;
        }
        
        // Check resource requirements
        for (const [resource, amount] of Object.entries(cost)) {
            if (Math.floor(this.resources[resource]) < amount) return false;
        }
        return true;
    }
    
    // NEW: Check if player can recruit a knight (now unlimited)
    canRecruitKnight(costs) {
        const knightCost = costs.knight;
        for (const [resource, amount] of Object.entries(knightCost)) {
            if (Math.floor(this.resources[resource]) < amount) return false;
        }
        return true; // No limit on knights anymore
    }
    
    canBuyDevelopmentCard(solCost) {
        return this.sol >= solCost;
    }
    
    buyDevelopmentCard(solCost, deck) {
        if (!this.canBuyDevelopmentCard(solCost) || deck.isEmpty()) return false;
        
        this.sol -= solCost;
        this.totalSOLSpent += solCost;
        
        const card = deck.drawCard();
        this.newlyBoughtCards.push(card);
        
        console.log(`    Player ${this.id} bought development card: ${card.name} for ${solCost} SOL`);
        return true;
    }
    
    playKnight() {
        const knightIndex = this.developmentCards.findIndex(card => card.type === 'knight');
        if (knightIndex === -1) return false;
        
        this.developmentCards.splice(knightIndex, 1);
        this.knightsPlayed++;
        
        console.log(`    Player ${this.id} played Knight (${this.knightsPlayed} total)`);
        return true;
    }
    
    // NEW: Pirate can now block AMM markets or traditional hexes
    playKnightWithPirate(game) {
        const knightIndex = this.developmentCards.findIndex(card => card.type === 'knight');
        if (knightIndex === -1) return false;
        
        this.developmentCards.splice(knightIndex, 1);
        this.knightsPlayed++;
        
        // 50% chance to block AMM market vs traditional hex blocking
        if (Math.random() > 0.5) {
            const resources = ['wood', 'brick', 'sheep', 'wheat', 'ore'];
            const targetMarket = resources[Math.floor(Math.random() * resources.length)];
            
            // Clear previous pirate blocks and set new one
            game.marketData.blockedMarkets.clear();
            game.marketData.blockedMarkets.add(targetMarket);
            
            console.log(`    Player ${this.id} played Knight (${this.knightsPlayed} total) - PIRATE BLOCKS ${targetMarket.toUpperCase()} MARKET!`);
        } else {
            console.log(`    Player ${this.id} played Knight (${this.knightsPlayed} total) - traditional hex blocking`);
        }
        
        return true;
    }
    
    // FIXED: Road Building requires resources but allows building up to 2 roads
    playRoadBuilding(costs) {
        const cardIndex = this.developmentCards.findIndex(card => 
            card.type === 'progress' && card.effect === 'road_building');
        if (cardIndex === -1) return false;
        
        const roadCost = costs.road;
        let roadsBuilt = 0;
        
        // Try to build 2 roads if possible
        for (let i = 0; i < 2; i++) {
            if (this.resources.wood >= roadCost.wood && this.resources.brick >= roadCost.brick) {
                this.resources.wood -= roadCost.wood;
                this.resources.brick -= roadCost.brick;
                this.buildings.roads++;
                roadsBuilt++;
            } else {
                break;
            }
        }
        
        if (roadsBuilt > 0) {
            this.developmentCards.splice(cardIndex, 1);
            console.log(`    Player ${this.id} played Road Building`);
            console.log(`      Built ${roadsBuilt} road(s) using resources → ${this.buildings.roads} total roads`);
            return true;
        }
        
        return false; // Not enough resources for even 1 road
    }
    
    playYearOfPlenty() {
        const cardIndex = this.developmentCards.findIndex(card => 
            card.type === 'progress' && card.effect === 'year_of_plenty');
        if (cardIndex === -1) return false;
        
        this.developmentCards.splice(cardIndex, 1);
        console.log(`    Player ${this.id} played Year of Plenty`);
        
        // Gain 2 resources of choice (simplified: random)
        const resources = ['wood', 'brick', 'sheep', 'wheat', 'ore'];
        const resource1 = resources[Math.floor(Math.random() * resources.length)];
        const resource2 = resources[Math.floor(Math.random() * resources.length)];
        this.resources[resource1] += 1;
        this.resources[resource2] += 1;
        this.totalResourcesGenerated += 2;
        console.log(`      Gained ${resource1} and ${resource2}`);
        return true;
    }
    
    // FIXED: Monopoly steals chosen resource from all other players
    playMonopoly(allPlayers) {
        const cardIndex = this.developmentCards.findIndex(card => 
            card.type === 'progress' && card.effect === 'monopoly');
        if (cardIndex === -1) return false;
        
        this.developmentCards.splice(cardIndex, 1);
        console.log(`    Player ${this.id} played Monopoly`);
        
        // Choose resource to monopolize (simplified: pick randomly)
        const resources = ['wood', 'brick', 'sheep', 'wheat', 'ore'];
        const chosenResource = resources[Math.floor(Math.random() * resources.length)];
        
        let totalStolen = 0;
        allPlayers.forEach(player => {
            if (player.id !== this.id) {
                const stolenAmount = Math.floor(player.resources[chosenResource]);
                if (stolenAmount > 0) {
                    player.resources[chosenResource] -= stolenAmount;
                    this.resources[chosenResource] += stolenAmount;
                    totalStolen += stolenAmount;
                }
            }
        });
        
        console.log(`      Monopolized ${chosenResource}: stole ${totalStolen} total from other players`);
        return true;
    }
    
    calculateTotalVP() {
        let vp = this.victoryPoints; // VP from buildings
        
        // Add VP from Victory Point cards
        this.developmentCards.forEach(card => {
            if (card.type === 'victory_point') {
                vp += card.vp;
            }
        });
        
        return vp;
    }
    
    build(buildingType, costs) {
        if (!this.canBuild(buildingType, costs)) return false;
        
        const cost = costs[buildingType];
        
        for (const [resource, amount] of Object.entries(cost)) {
            this.resources[resource] -= amount;
        }
        
        if (buildingType === 'settlement') {
            this.buildings.settlements++;
            this.victoryPoints += 1;
            console.log(`    Player ${this.id} built settlement → ${this.buildings.settlements} settlements, ${this.calculateTotalVP()} VP`);
            
        } else if (buildingType === 'city') {
            this.buildings.settlements--;
            this.buildings.cities++;
            this.victoryPoints += 1;
            console.log(`    Player ${this.id} upgraded to city → ${this.buildings.settlements} settlements, ${this.buildings.cities} cities, ${this.calculateTotalVP()} VP`);
            
        } else if (buildingType === 'road') {
            this.buildings.roads++;
            console.log(`    Player ${this.id} built road → ${this.buildings.roads} roads`);
        }
        
        return true;
    }
    
    startTurn() {
        // Move newly bought cards to playable cards
        this.developmentCards.push(...this.newlyBoughtCards);
        this.newlyBoughtCards = [];
    }
}

class SOLCatammGame {
    constructor() {
        this.players = [new Player(0), new Player(1), new Player(2), new Player(3)];
        this.currentPlayer = 0;
        this.turn = 0;
        this.maxTurns = 30;
        this.developmentCardDeck = new DevelopmentCardDeck();
        
        // Create SOL-based AMM pools for each resource
        this.pools = new Map();
        const resources = ['wood', 'brick', 'sheep', 'wheat', 'ore'];
        resources.forEach(resource => {
            this.pools.set(resource, new SOLAMMPool(resource));
        });
        
        // AMM market tracking with Ghost Ship
        this.marketData = {
            initialLiquidity: {},
            totalVolume: {},
            transactionCount: {},
        };
        
        // NEW: Single Ghost Ship that can block markets or hexes
        this.ghostShip = {
            location: null, // 'market_name' or 'hex_number' or null
            blockedMarkets: new Set(), // Only one market can be blocked at a time
            moveCount: 0 // Track how often it's moved
        };
        
        // Initialize market tracking
        resources.forEach(resource => {
            const pool = this.pools.get(resource);
            this.marketData.initialLiquidity[resource] = {
                sol: pool.solReserve,
                resource: pool.resourceReserve
            };
            this.marketData.totalVolume[resource] = 0;
            this.marketData.transactionCount[resource] = 0;
        });
        
        this.executeInitialPlacement();
        this.initialSOLSupply = this.calculateTotalSOLSupply();
    }
    
    executeInitialPlacement() {
        console.log("=== INITIAL UNIT PLACEMENT PHASE ===");
        
        this.players.forEach((player, index) => {
            player.buildings.settlements = 2;
            player.buildings.roads = 2;
            player.victoryPoints = 2;
            
            // Starting resources from settlement placement (use SOL to buy)
            const startingSOLSpent = Math.floor(Math.random() * 20) + 15;
            this.generateStartingResourcesWithSOL(player, startingSOLSpent);
            
            console.log(`Player ${index}: 2 settlements, 2 roads, 2 VP, ${player.sol.toFixed(1)} SOL remaining`);
        });
        
        console.log("Initial placement complete!\n");
    }
    
    generateStartingResourcesWithSOL(player, solToSpend) {
        const resources = ['wood', 'brick', 'sheep', 'wheat', 'ore'];
        let remainingSOL = solToSpend;
        
        // Randomly buy resources with starting SOL
        while (remainingSOL > 3) {
            const resource = resources[Math.floor(Math.random() * resources.length)];
            const pool = this.pools.get(resource);
            const solToUse = Math.min(remainingSOL * 0.5, 8);
            
            if (solToUse >= 1) {
                const resourceGained = pool.buyResource(solToUse);
                player.resources[resource] += resourceGained;
                player.sol -= solToUse;
                player.totalSOLSpent += solToUse;
                remainingSOL -= solToUse;
            } else {
                break;
            }
        }
    }
    
    calculateTotalSOLSupply() {
        let playerSOL = 0;
        this.players.forEach(player => {
            playerSOL += player.sol;
        });
        
        let poolSOL = 0;
        this.pools.forEach(pool => {
            poolSOL += pool.solReserve;
        });
        
        return playerSOL + poolSOL;
    }
    
    calculateDynamicCosts() {
        // Building costs remain in resources, but dev cards cost SOL
        const baseCosts = {
            road: { wood: 1, brick: 1 },
            settlement: { wood: 1, brick: 1, sheep: 1, wheat: 1 },
            city: { wheat: 2, ore: 3 },
            knight: { sheep: 1, wheat: 1, ore: 1 }, // NEW: Knight recruitment cost
            moveKnight: { sheep: 1 } // NEW: Knight movement cost
        };
        
        // Development card cost scales with turn (increasing SOL price)
        const devCardSOLCost = Math.ceil(15 + this.turn * 0.5);
        
        return { costs: baseCosts, devCardSOLCost };
    }
    
    checkLargestArmy() {
        const playerArmies = this.players.map(p => p.knightsPlayed + p.activeKnights);
        const maxArmy = Math.max(...playerArmies);
        
        if (maxArmy >= 3) {
            const playersWithMaxArmy = this.players.filter(p => (p.knightsPlayed + p.activeKnights) === maxArmy);
            if (playersWithMaxArmy.length === 1) {
                return playersWithMaxArmy[0].id;
            }
        }
        return null;
    }
    
    checkLongestRoad() {
        const playerRoads = this.players.map(p => p.buildings.roads);
        const maxRoads = Math.max(...playerRoads);
        
        if (maxRoads >= 5) {
            const playersWithMaxRoads = this.players.filter(p => p.buildings.roads === maxRoads);
            if (playersWithMaxRoads.length === 1) {
                return playersWithMaxRoads[0].id;
            }
        }
        return null;
    }
    
    calculatePlayerTotalVP(player) {
        let vp = player.calculateTotalVP(); // Buildings + VP cards
        
        // Add Largest Army bonus
        if (this.checkLargestArmy() === player.id) {
            vp += 2;
        }
        
        // Add Longest Road bonus
        if (this.checkLongestRoad() === player.id) {
            vp += 2;
        }
        
        return vp;
    }
    
    rollDice() {
        const roll = Math.floor(Math.random() * 6) + Math.floor(Math.random() * 6) + 2;
        
        // NEW: Rolling 7 allows moving ghost ship
        if (roll === 7) {
            console.log(`    🎲 Rolled 7! Ghost ship moves...`);
            this.moveGhostShipOn7();
        }
        
        return roll;
    }
    
    // NEW: Ghost ship movement on rolling 7
    moveGhostShipOn7() {
        // Random player gets to move the ghost ship when 7 is rolled
        const moverPlayer = this.players[Math.floor(Math.random() * this.players.length)];
        moverPlayer.moveGhostShip(this);
        this.ghostShip.moveCount++;
        console.log(`    Player ${moverPlayer.id} moves ghost ship (roll 7 trigger)`);
    }
    
    generateResources(player, diceRoll) {
        const baseGeneration = Math.max(0, 8 - Math.abs(7 - diceRoll)) / 6;
        const settlements = player.buildings.settlements;
        const cities = player.buildings.cities;
        const totalGeneration = (settlements + cities * 2) * baseGeneration;
        
        const resources = ['wood', 'brick', 'sheep', 'wheat', 'ore'];
        let generatedThisTurn = 0;
        
        for (let i = 0; i < totalGeneration; i++) {
            const resource = resources[Math.floor(Math.random() * resources.length)];
            player.resources[resource] += 1;
            player.totalResourcesGenerated += 1;
            generatedThisTurn += 1;
        }
        
        if (generatedThisTurn > 0) {
            console.log(`    Player ${player.id} generated ${generatedThisTurn} resources`);
        }
    }
    
    attemptResourceTrading(player) {
        const { costs } = this.calculateDynamicCosts();
        const needs = this.calculateResourceNeeds(player, costs);
        
        // Try to buy needed resources with SOL
        for (const [resource, amountNeeded] of Object.entries(needs)) {
            if (amountNeeded > 0 && player.sol > 8) {
                const pool = this.pools.get(resource);
                const currentPrice = pool.getPrice();
                const solNeeded = currentPrice * amountNeeded;
                
                if (player.sol >= solNeeded && solNeeded > 0) {
                    const solToSpend = Math.min(player.sol * 0.3, solNeeded);
                    const resourceGained = pool.buyResource(solToSpend);
                    
                    player.sol -= solToSpend;
                    player.totalSOLSpent += solToSpend;
                    player.resources[resource] += resourceGained;
                    
                    console.log(`    Player ${player.id} bought ${resourceGained.toFixed(1)} ${resource} for ${solToSpend.toFixed(1)} SOL`);
                    return true;
                }
            }
        }
        
        // Try to sell excess resources for SOL
        const resources = ['wood', 'brick', 'sheep', 'wheat', 'ore'];
        for (const resource of resources) {
            if (player.resources[resource] > 4) {
                const pool = this.pools.get(resource);
                const amountToSell = Math.min(player.resources[resource] * 0.25, 2);
                
                if (amountToSell > 0.1) {
                    const solGained = pool.sellResource(amountToSell);
                    player.resources[resource] -= amountToSell;
                    player.sol += solGained;
                    
                    console.log(`    Player ${player.id} sold ${amountToSell.toFixed(1)} ${resource} for ${solGained.toFixed(1)} SOL`);
                    return true;
                }
            }
        }
        
        return false;
    }
    
    calculateResourceNeeds(player, costs) {
        const needs = { wood: 0, brick: 0, sheep: 0, wheat: 0, ore: 0 };
        
        // Check needs for cities
        if (player.buildings.settlements > 0 && !player.canBuild('city', costs)) {
            for (const [resource, amount] of Object.entries(costs.city)) {
                if (Math.floor(player.resources[resource]) < amount) {
                    needs[resource] += (amount - Math.floor(player.resources[resource]));
                }
            }
        }
        
        // Check needs for settlements
        if (!player.canBuild('settlement', costs)) {
            for (const [resource, amount] of Object.entries(costs.settlement)) {
                if (Math.floor(player.resources[resource]) < amount) {
                    needs[resource] += (amount - Math.floor(player.resources[resource]));
                }
            }
        }
        
        return needs;
    }
    
    simulatePlayerTurn(player) {
        player.startTurn();
        
        const diceRoll = this.rollDice();
        console.log(`  Player ${player.id} rolled ${diceRoll}`);
        
        this.generateResources(player, diceRoll);
        
        const { costs, devCardSOLCost } = this.calculateDynamicCosts();
        
        // Enhanced AI strategy with proper Catan constraints
        for (let action = 0; action < 8; action++) { // More actions for new mechanics
            let actionTaken = false;
            
            // 1. Play development cards if beneficial
            if (player.developmentCards.length > 0) {
                if (player.playKnightWithPirate(this)) {
                    actionTaken = true;
                    continue;
                }
                if (player.playYearOfPlenty()) {
                    actionTaken = true;
                    continue;
                }
                if (player.playRoadBuilding(costs)) {
                    actionTaken = true;
                    continue;
                }
                if (player.playMonopoly(this.players)) {
                    actionTaken = true;
                    continue;
                }
            }
            
            // 2. Buy development cards with SOL
            if (player.canBuyDevelopmentCard(devCardSOLCost) && !this.developmentCardDeck.isEmpty()) {
                player.buyDevelopmentCard(devCardSOLCost, this.developmentCardDeck);
                actionTaken = true;
                continue;
            }
            
            // 3. Build cities (highest priority)
            if (player.canBuild('city', costs)) {
                player.build('city', costs);
                actionTaken = true;
                continue;
            }
            
            // 4. Build settlements
            if (player.canBuild('settlement', costs)) {
                player.build('settlement', costs);
                actionTaken = true;
                continue;
            }
            
            // 5. NEW: Recruit knights
            if (player.canRecruitKnight(costs)) {
                player.recruitKnight(costs);
                actionTaken = true;
                continue;
            }
            
            // 6. Build roads
            if (player.canBuild('road', costs)) {
                player.build('road', costs);
                actionTaken = true;
                continue;
            }
            
            // 7. NEW: Use knights to move ghost ship (if beneficial)
            if (player.activeKnights > 0 && Math.random() > 0.8) {
                if (player.useKnightToMoveGhostShip(this, costs)) {
                    actionTaken = true;
                    continue;
                }
            }
            
            // 8. Trade resources using SOL
            if (this.attemptResourceTrading(player)) {
                actionTaken = true;
                continue;
            }
            
            // 9. Provide liquidity to AMM pools
            if (this.attemptLiquidityProvision(player)) {
                actionTaken = true;
                continue;
            }
            
            if (!actionTaken) break;
        }
        
        const totalVP = this.calculatePlayerTotalVP(player);
        const armyBonus = this.checkLargestArmy() === player.id ? " +LA" : "";
        const roadBonus = this.checkLongestRoad() === player.id ? " +LR" : "";
        
        console.log(`    Player ${player.id} end turn: ${totalVP} VP${armyBonus}${roadBonus}, ${player.sol.toFixed(1)} SOL, ${player.getTotalResources().toFixed(1)} resources`);
        
        return totalVP >= 10;
    }
    
    playGame() {
        console.log("=== GAME START ===\n");
        
        while (this.turn < this.maxTurns) {
            this.turn++;
            console.log(`TURN ${this.turn}:`);
            
            for (let playerIndex = 0; playerIndex < this.players.length; playerIndex++) {
                const player = this.players[playerIndex];
                const hasWon = this.simulatePlayerTurn(player);
                
                if (hasWon) {
                    console.log(`\n🏆 GAME OVER! Player ${player.id} wins with ${this.calculatePlayerTotalVP(player)} victory points! 🏆`);
                    this.printFinalStats();
                    return;
                }
            }
            
            // Print turn summary every 3 turns
            if (this.turn % 3 === 0) {
                this.printTurnSummary();
            }
            
            console.log("");
        }
        
        console.log("\n⏰ Game ended due to turn limit");
        this.printFinalStats();
    }
    
    printTurnSummary() {
        console.log("\n--- TURN SUMMARY ---");
        this.players.forEach(player => {
            const vp = this.calculatePlayerTotalVP(player);
            const armyHolder = this.checkLargestArmy() === player.id ? " 🗡️" : "";
            const roadHolder = this.checkLongestRoad() === player.id ? " 🛤️" : "";
            console.log(`Player ${player.id}: ${vp} VP${armyHolder}${roadHolder}, ${player.buildings.settlements}S ${player.buildings.cities}C ${player.buildings.roads}R, ${player.knightsPlayed}K, ${player.sol.toFixed(0)} SOL`);
        });
        
        // Show resource prices
        console.log("\nResource Prices (SOL per unit):");
        this.pools.forEach((pool, resource) => {
            const blocked = this.ghostShip.blockedMarkets.has(resource) ? " [👻 BLOCKED]" : "";
            console.log(`  ${resource}: ${pool.getPrice().toFixed(2)} SOL${blocked}`);
        });
        
        console.log(`\nGhost Ship Status: ${this.ghostShip.location || 'Not deployed'} (moved ${this.ghostShip.moveCount} times)`);
    }
    
    printFinalStats() {
        console.log("\n=== FINAL GAME STATISTICS ===");
        
        // Sort players by VP
        const sortedPlayers = [...this.players].sort((a, b) => 
            this.calculatePlayerTotalVP(b) - this.calculatePlayerTotalVP(a));
        
        console.log("\nFinal Standings:");
        sortedPlayers.forEach((player, rank) => {
            const vp = this.calculatePlayerTotalVP(player);
            const armyHolder = this.checkLargestArmy() === player.id ? " [Largest Army +2]" : "";
            const roadHolder = this.checkLongestRoad() === player.id ? " [Longest Road +2]" : "";
            console.log(`${rank + 1}. Player ${player.id}: ${vp} VP${armyHolder}${roadHolder}`);
            console.log(`   Buildings: ${player.buildings.settlements}S ${player.buildings.cities}C ${player.buildings.roads}R`);
            console.log(`   Knights: ${player.knightsPlayed}, Dev Cards: ${player.developmentCards.length}, SOL: ${player.sol.toFixed(1)}`);
        });
        
        // Development card analysis
        console.log("\nDevelopment Card Usage:");
        this.players.forEach(player => {
            const vpCards = player.developmentCards.filter(c => c.type === 'victory_point').length;
            console.log(`Player ${player.id}: ${player.knightsPlayed} knights played, ${player.activeKnights} recruited, ${vpCards} VP cards held`);
        });
        
        // NEW: Building capacity analysis (no knight limits)
        console.log("\nBuilding Capacity Utilization:");
        this.players.forEach(player => {
            console.log(`Player ${player.id}: ${player.buildings.settlements}/${player.maxSettlements}S ${player.buildings.cities}/${player.maxCities}C ${player.buildings.roads}/${player.maxRoads}R ${player.activeKnights} knights`);
        });
        
        console.log(`\nGhost Ship Activity: Moved ${this.ghostShip.moveCount} times, currently at ${this.ghostShip.location || 'nowhere'}`);
        
        // Economic analysis
        console.log("\nEconomic Summary:");
        this.players.forEach(player => {
            console.log(`Player ${player.id}: Spent ${player.totalSOLSpent.toFixed(1)} SOL, Generated ${player.totalResourcesGenerated} resources`);
        });
        
        console.log(`\nTotal SOL in circulation: ${this.calculateTotalSOLSupply().toFixed(1)} (started with ${this.initialSOLSupply.toFixed(1)})`);
    }
}

// Run the simulation
console.log("SOL Catamm - Fixed Version");
console.log("==========================");
console.log("Key Features:");
console.log("• SOL-based AMM pools for each resource");
console.log("• Dynamic resource pricing");
console.log("• Fixed Road Building (requires wood+brick)");
console.log("• Fixed Monopoly (steals chosen resource)");
console.log("• Largest Army & Longest Road bonuses");
console.log("• Development cards with proper mechanics");
console.log("• Competitive 4-player gameplay\n");

const game = new SOLCatammGame();
game.playGame();