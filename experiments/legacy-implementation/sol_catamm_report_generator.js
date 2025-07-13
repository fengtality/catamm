// SOL Catamm Multi-Game Analysis Report Generator
// This code can be reused to analyze any set of SOL Catamm game results

function generateComprehensiveReport(gameResults) {
    const report = {
        meta: {
            totalGames: gameResults.length,
            reportGenerated: new Date().toISOString(),
            gameType: "SOL Catamm"
        },
        summary: {},
        playerAnalysis: {},
        gameMetrics: {},
        strategicInsights: {},
        economicAnalysis: {},
        ammMarketAnalysis: {} // NEW: AMM market analysis section
    };
    
    // === SUMMARY STATISTICS ===
    const winners = gameResults.map(g => g.winner);
    const winnerCounts = [0, 1, 2, 3].map(playerId => 
        winners.filter(w => w === playerId).length);
    
    const avgTurns = gameResults.reduce((sum, g) => sum + g.turnsPlayed, 0) / gameResults.length;
    const avgWinnerVP = gameResults.reduce((sum, g) => sum + g.winnerVP, 0) / gameResults.length;
    
    const gameEndReasons = gameResults.reduce((acc, g) => {
        acc[g.gameEndReason] = (acc[g.gameEndReason] || 0) + 1;
        return acc;
    }, {});
    
    report.summary = {
        playerWinRates: winnerCounts.map((wins, id) => ({
            playerId: id,
            wins: wins,
            winRate: `${(wins / gameResults.length * 100).toFixed(1)}%`
        })),
        averageTurnsPerGame: Math.round(avgTurns * 10) / 10,
        averageWinnerVP: Math.round(avgWinnerVP * 10) / 10,
        gameEndReasons: gameEndReasons,
        mostSuccessfulPlayer: winnerCounts.indexOf(Math.max(...winnerCounts)),
        gameBalance: {
            isBalanced: Math.max(...winnerCounts) - Math.min(...winnerCounts) <= 2,
            spread: Math.max(...winnerCounts) - Math.min(...winnerCounts)
        }
    };
    
    // === AMM MARKET ANALYSIS ===
    if (gameResults.length > 0 && gameResults[0].ammMarketData) {
        const ammData = gameResults.map(g => g.ammMarketData);
        const resources = ['wood', 'brick', 'sheep', 'wheat', 'ore'];
        
        // Calculate average metrics across all games
        const avgInitialLiquidity = resources.reduce((acc, resource) => {
            const avgSol = ammData.reduce((sum, d) => sum + d.initialLiquidity[resource].sol, 0) / ammData.length;
            const avgResource = ammData.reduce((sum, d) => sum + d.initialLiquidity[resource].resource, 0) / ammData.length;
            acc[resource] = { sol: avgSol, resource: avgResource };
            return acc;
        }, {});
        
        const avgFinalLiquidity = resources.reduce((acc, resource) => {
            const avgSol = ammData.reduce((sum, d) => sum + d.finalLiquidity[resource].sol, 0) / ammData.length;
            const avgResource = ammData.reduce((sum, d) => sum + d.finalLiquidity[resource].resource, 0) / ammData.length;
            acc[resource] = { sol: avgSol, resource: avgResource };
            return acc;
        }, {});
        
        const totalVolume = resources.reduce((acc, resource) => {
            acc[resource] = ammData.reduce((sum, d) => sum + d.totalVolume[resource], 0);
            return acc;
        }, {});
        
        const totalTransactions = resources.reduce((acc, resource) => {
            acc[resource] = ammData.reduce((sum, d) => sum + d.transactionCount[resource], 0);
            return acc;
        }, {});
        
        const marketBlockingFrequency = resources.reduce((acc, resource) => {
            acc[resource] = ammData.reduce((sum, d) => sum + (d.blockedMarkets.includes(resource) ? 1 : 0), 0);
            return acc;
        }, {});
        
        // Calculate market utilization
    // === AMM MARKET ANALYSIS ===
    if (gameResults.length > 0 && gameResults[0].ammMarketData) {
        const ammData = gameResults.map(g => g.ammMarketData);
        const resources = ['wood', 'brick', 'sheep', 'wheat', 'ore'];
        
        // Calculate average metrics across all games
        const avgInitialLiquidity = resources.reduce((acc, resource) => {
            const avgSol = ammData.reduce((sum, d) => sum + d.initialLiquidity[resource].sol, 0) / ammData.length;
            const avgResource = ammData.reduce((sum, d) => sum + d.initialLiquidity[resource].resource, 0) / ammData.length;
            acc[resource] = { sol: avgSol, resource: avgResource };
            return acc;
        }, {});
        
        const avgFinalLiquidity = resources.reduce((acc, resource) => {
            const avgSol = ammData.reduce((sum, d) => sum + d.finalLiquidity[resource].sol, 0) / ammData.length;
            const avgResource = ammData.reduce((sum, d) => sum + d.finalLiquidity[resource].resource, 0) / ammData.length;
            acc[resource] = { sol: avgSol, resource: avgResource };
            return acc;
        }, {});
        
        const totalVolume = resources.reduce((acc, resource) => {
            acc[resource] = ammData.reduce((sum, d) => sum + d.totalVolume[resource], 0);
            return acc;
        }, {});
        
        const totalTransactions = resources.reduce((acc, resource) => {
            acc[resource] = ammData.reduce((sum, d) => sum + d.transactionCount[resource], 0);
            return acc;
        }, {});
        
        const marketBlockingFrequency = resources.reduce((acc, resource) => {
            acc[resource] = ammData.reduce((sum, d) => {
                if (d.ghostShipData) {
                    return sum + (d.ghostShipData.blockedMarkets.includes(resource) ? 1 : 0);
                }
                return sum + (d.blockedMarkets ? d.blockedMarkets.includes(resource) ? 1 : 0 : 0);
            }, 0);
            return acc;
        }, {});
        
        // NEW: Enhanced market analysis metrics
        const marketAnalytics = resources.reduce((acc, resource) => {
            const avgVolume = totalVolume[resource] / gameResults.length;
            const avgTx = totalTransactions[resource] / gameResults.length;
            const avgTxSize = avgVolume / Math.max(avgTx, 1);
            
            const initialSol = avgInitialLiquidity[resource].sol;
            const finalSol = avgFinalLiquidity[resource].sol;
            const liquidityGrowth = ((finalSol - initialSol) / initialSol * 100);
            const volumeToLiquidityRatio = avgVolume / initialSol;
            
            // Price impact analysis
            const avgPriceChange = ammData.reduce((sum, d) => {
                const initial = d.initialLiquidity[resource];
                const final = d.finalLiquidity[resource];
                const initialPrice = initial.sol / initial.resource;
                const finalPrice = final.sol / final.resource;
                return sum + ((finalPrice - initialPrice) / initialPrice * 100);
            }, 0) / ammData.length;
            
            acc[resource] = {
                avgVolume: avgVolume,
                avgTransactions: avgTx,
                avgTransactionSize: avgTxSize,
                liquidityGrowth: liquidityGrowth,
                volumeToLiquidityRatio: volumeToLiquidityRatio,
                avgPriceChange: avgPriceChange,
                utilization: volumeToLiquidityRatio > 1.5 ? 'High' : 
                           volumeToLiquidityRatio > 0.8 ? 'Medium' : 'Low',
                marketEfficiency: avgTxSize > 10 && Math.abs(avgPriceChange) < 15 ? 'Efficient' : 
                                avgTxSize > 5 ? 'Moderate' : 'Inefficient'
            };
            return acc;
        }, {});
        
        // Market rankings
        const volumeRanking = resources.sort((a, b) => 
            marketAnalytics[b].avgVolume - marketAnalytics[a].avgVolume);
        const efficiencyRanking = resources.filter(r => 
            marketAnalytics[r].marketEfficiency === 'Efficient');
        const highUtilizationMarkets = resources.filter(r => 
            marketAnalytics[r].utilization === 'High');
        
        // Overall market health
        const totalGameVolume = Object.values(totalVolume).reduce((sum, v) => sum + v, 0);
        const avgTransactionSize = Object.values(marketAnalytics)
            .reduce((sum, m) => sum + m.avgTransactionSize, 0) / resources.length;
        const avgVolatility = Math.abs(Object.values(marketAnalytics)
            .reduce((sum, m) => sum + m.avgPriceChange, 0) / resources.length);
        
        // Market usage assessment
        const marketUsageLevel = totalGameVolume > 1000 ? 'Very High' :
                               totalGameVolume > 500 ? 'High' :
                               totalGameVolume > 200 ? 'Moderate' : 'Low';
        
        // Ghost ship impact analysis
        const ghostShipImpact = ammData.some(d => d.ghostShipData) ? {
            totalMoves: ammData.reduce((sum, d) => sum + (d.ghostShipData ? d.ghostShipData.moveCount : 0), 0),
            avgMovesPerGame: ammData.reduce((sum, d) => sum + (d.ghostShipData ? d.ghostShipData.moveCount : 0), 0) / gameResults.length,
            marketBlockingRate: Object.values(marketBlockingFrequency).reduce((sum, f) => sum + f, 0) / (gameResults.length * resources.length) * 100
        } : null;
        
        report.ammMarketAnalysis = {
            liquidityMetrics: {
                initialLiquidity: avgInitialLiquidity,
                finalLiquidity: avgFinalLiquidity,
                liquidityGrowth: resources.reduce((acc, resource) => {
                    acc[resource] = {
                        absolute: (avgFinalLiquidity[resource].sol - avgInitialLiquidity[resource].sol).toFixed(1),
                        percentage: marketAnalytics[resource].liquidityGrowth.toFixed(1)
                    };
                    return acc;
                }, {})
            },
            tradingActivity: {
                totalVolumeByMarket: totalVolume,
                totalTransactionsByMarket: totalTransactions,
                marketAnalytics: marketAnalytics,
                volumeRanking: volumeRanking,
                highUtilizationMarkets: highUtilizationMarkets,
                mostTradedMarket: volumeRanking[0],
                leastTradedMarket: volumeRanking[volumeRanking.length - 1],
                totalGameVolume: totalGameVolume,
                avgTransactionSize: avgTransactionSize
            },
            priceAnalysis: {
                averagePriceChanges: resources.reduce((acc, resource) => {
                    acc[resource] = marketAnalytics[resource].avgPriceChange.toFixed(1);
                    return acc;
                }, {}),
                avgVolatility: avgVolatility.toFixed(1),
                priceStability: avgVolatility < 10 ? 'Stable' : avgVolatility < 20 ? 'Moderate' : 'Volatile'
            },
            marketEfficiency: {
                efficientMarkets: efficiencyRanking,
                avgTransactionSize: avgTransactionSize.toFixed(1),
                liquidityUtilization: resources.reduce((acc, resource) => {
                    acc[resource] = marketAnalytics[resource].volumeToLiquidityRatio.toFixed(2);
                    return acc;
                }, {}),
                overallEfficiency: efficiencyRanking.length >= 3 ? 'High' : 
                                 efficiencyRanking.length >= 2 ? 'Medium' : 'Low'
            },
            ghostShipAnalysis: ghostShipImpact ? {
                totalMoves: ghostShipImpact.totalMoves,
                avgMovesPerGame: ghostShipImpact.avgMovesPerGame.toFixed(1),
                marketBlockingRate: ghostShipImpact.marketBlockingRate.toFixed(1) + '%',
                blockingFrequency: marketBlockingFrequency,
                mostTargetedMarket: resources.reduce((a, b) => 
                    marketBlockingFrequency[a] > marketBlockingFrequency[b] ? a : b),
                strategicImpact: ghostShipImpact.avgMovesPerGame > 2 ? 'High' : 
                               ghostShipImpact.avgMovesPerGame > 1 ? 'Medium' : 'Low'
            } : null,
            marketHealth: {
                usageLevel: marketUsageLevel,
                playerEngagement: totalGameVolume > 500 ? 'Active SOL Trading' : 'Traditional Focus',
                marketMaturity: avgTransactionSize > 8 && avgVolatility < 15 ? 'Mature' : 'Developing',
                liquidityDepth: Object.values(marketAnalytics).every(m => m.utilization !== 'Low') ? 'Deep' : 'Shallow'
            },
            strategicInsights: {
                dominantStrategy: marketUsageLevel === 'Very High' ? 'AMM-Focused' : 
                                marketUsageLevel === 'High' ? 'Hybrid Trading' : 'Traditional Building',
                resourceBottlenecks: resources.filter(r => marketAnalytics[r].avgVolume > 80),
                emergingPatterns: highUtilizationMarkets.length > 3 ? 'Widespread AMM adoption' :
                                highUtilizationMarkets.length > 1 ? 'Selective AMM usage' : 'Limited AMM integration',
                recommendedFocus: volumeRanking.slice(0, 2).join(' and ') + ' markets show highest activity'
            }
        };
    } else {
        // Fallback for games without AMM data
        report.ammMarketAnalysis = {
            liquidityMetrics: null,
            tradingActivity: null,
            priceAnalysis: null,
            marketEfficiency: null,
            ghostShipAnalysis: null,
            marketHealth: null,
            strategicInsights: { note: "AMM data not available for these games" }
        };
    }
    
    // === PLAYER PERFORMANCE ANALYSIS ===
    report.playerAnalysis = {};
    
    for (let playerId = 0; playerId < 4; playerId++) {
        const playerGames = gameResults.map(g => g.players.find(p => p.id === playerId));
        
        const avgVP = playerGames.reduce((sum, p) => sum + p.vp, 0) / playerGames.length;
        const avgSOLSpent = playerGames.reduce((sum, p) => sum + p.solSpent, 0) / playerGames.length;
        const avgSettlements = playerGames.reduce((sum, p) => sum + p.settlements, 0) / playerGames.length;
        const avgCities = playerGames.reduce((sum, p) => sum + p.cities, 0) / playerGames.length;
        const avgRoads = playerGames.reduce((sum, p) => sum + p.roads, 0) / playerGames.length;
        const avgKnights = playerGames.reduce((sum, p) => sum + p.knightsPlayed, 0) / playerGames.length;
        const avgDevCards = playerGames.reduce((sum, p) => sum + p.devCards, 0) / playerGames.length;
        
        const largestArmyCount = gameResults.filter(g => g.largestArmyHolder === playerId).length;
        const longestRoadCount = gameResults.filter(g => g.longestRoadHolder === playerId).length;
        
        report.playerAnalysis[`player${playerId}`] = {
            gamesWon: winnerCounts[playerId],
            averageVP: Math.round(avgVP * 10) / 10,
            averageSOLSpent: Math.round(avgSOLSpent * 10) / 10,
            averageBuildings: {
                settlements: Math.round(avgSettlements * 10) / 10,
                cities: Math.round(avgCities * 10) / 10,
                roads: Math.round(avgRoads * 10) / 10
            },
            averageKnightsPlayed: Math.round(avgKnights * 10) / 10,
            averageDevCards: Math.round(avgDevCards * 10) / 10,
            specialAchievements: {
                largestArmyWins: largestArmyCount,
                longestRoadWins: longestRoadCount
            },
            solEfficiency: Math.round((avgVP / avgSOLSpent) * 1000) / 1000 // VP per SOL
        };
    }
    
    // === GAME METRICS ===
    const shortGames = gameResults.filter(g => g.turnsPlayed <= 15).length;
    const mediumGames = gameResults.filter(g => g.turnsPlayed > 15 && g.turnsPlayed <= 20).length;
    const longGames = gameResults.filter(g => g.turnsPlayed > 20).length;
    
    const closeGames = gameResults.filter(g => {
        const sortedPlayers = g.players.sort((a, b) => b.vp - a.vp);
        return sortedPlayers[0].vp - sortedPlayers[1].vp <= 2;
    }).length;
    
    report.gameMetrics = {
        gameLengthDistribution: {
            short: `${shortGames} games (≤15 turns)`,
            medium: `${mediumGames} games (16-20 turns)`,
            long: `${longGames} games (>20 turns)`
        },
        competitiveness: {
            closeGames: closeGames,
            closeGamePercentage: `${(closeGames / gameResults.length * 100).toFixed(1)}%`,
            blowouts: gameResults.length - closeGames
        },
        victoryPointRange: {
            lowest: Math.min(...gameResults.map(g => g.winnerVP)),
            highest: Math.max(...gameResults.map(g => g.winnerVP)),
            mostCommon: getMostCommonVP(gameResults.map(g => g.winnerVP))
        }
    };
    
    // === STRATEGIC INSIGHTS ===
    const armyHolders = gameResults.filter(g => g.largestArmyHolder !== null);
    const roadHolders = gameResults.filter(g => g.longestRoadHolder !== null);
    
    const armyWinRate = armyHolders.filter(g => g.winner === g.largestArmyHolder).length / armyHolders.length;
    const roadWinRate = roadHolders.filter(g => g.winner === g.longestRoadHolder).length / roadHolders.length;
    
    // Analyze building strategies
    const allPlayers = gameResults.flatMap(g => g.players);
    const avgBuildingRatios = {
        settlementToCity: allPlayers.reduce((sum, p) => sum + (p.cities > 0 ? p.settlements / p.cities : p.settlements), 0) / allPlayers.length,
        roadsPerSettlement: allPlayers.reduce((sum, p) => sum + (p.roads / Math.max(p.settlements + p.cities, 1)), 0) / allPlayers.length
    };
    
    report.strategicInsights = {
        specialCardEffectiveness: {
            largestArmyGames: armyHolders.length,
            largestArmyWinRate: `${(armyWinRate * 100).toFixed(1)}%`,
            longestRoadGames: roadHolders.length,
            longestRoadWinRate: `${(roadWinRate * 100).toFixed(1)}%`
        },
        buildingStrategies: {
            averageSettlementToCityRatio: Math.round(avgBuildingRatios.settlementToCity * 100) / 100,
            averageRoadsPerBuilding: Math.round(avgBuildingRatios.roadsPerSettlement * 100) / 100
        },
        developmentCardUsage: {
            averageKnightsPerPlayer: Math.round(allPlayers.reduce((sum, p) => sum + p.knightsPlayed, 0) / allPlayers.length * 100) / 100,
            averageDevCardsHeld: Math.round(allPlayers.reduce((sum, p) => sum + p.devCards, 0) / allPlayers.length * 100) / 100
        }
    };
    
    // === ECONOMIC ANALYSIS ===
    const totalSOLSpent = allPlayers.reduce((sum, p) => sum + p.solSpent, 0);
    const avgSOLPerPlayer = totalSOLSpent / allPlayers.length;
    
    // Find correlations
    const solVPCorrelation = calculateCorrelation(
        allPlayers.map(p => p.solSpent),
        allPlayers.map(p => p.vp)
    );
    
    const highSpenders = allPlayers.filter(p => p.solSpent > avgSOLPerPlayer * 1.2);
    const lowSpenders = allPlayers.filter(p => p.solSpent < avgSOLPerPlayer * 0.8);
    
    report.economicAnalysis = {
        solSpendingStats: {
            totalSOLSpent: Math.round(totalSOLSpent),
            averageSOLPerPlayer: Math.round(avgSOLPerPlayer * 10) / 10,
            highestSpender: Math.max(...allPlayers.map(p => p.solSpent)).toFixed(1),
            lowestSpender: Math.min(...allPlayers.map(p => p.solSpent)).toFixed(1)
        },
        spendingEfficiency: {
            solToVPCorrelation: Math.round(solVPCorrelation * 1000) / 1000,
            correlationStrength: getCorrelationStrength(solVPCorrelation),
            highSpendersAvgVP: Math.round(highSpenders.reduce((sum, p) => sum + p.vp, 0) / highSpenders.length * 10) / 10,
            lowSpendersAvgVP: Math.round(lowSpenders.reduce((sum, p) => sum + p.vp, 0) / lowSpenders.length * 10) / 10
        },
        economicStrategy: {
            recommendedSpendingRange: `${Math.round(avgSOLPerPlayer * 0.9)}-${Math.round(avgSOLPerPlayer * 1.1)} SOL`,
            optimalSpendingThreshold: avgSOLPerPlayer > 100 ? "High SOL investment pays off" : "Conservative spending is effective"
        }
    };
    
    return report;
}

// Helper functions
function getMostCommonVP(vpArray) {
    const counts = vpArray.reduce((acc, vp) => {
        acc[vp] = (acc[vp] || 0) + 1;
        return acc;
    }, {});
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
}

function calculateCorrelation(x, y) {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
}

function getCorrelationStrength(correlation) {
    const abs = Math.abs(correlation);
    if (abs >= 0.7) return "Strong";
    if (abs >= 0.5) return "Moderate";
    if (abs >= 0.3) return "Weak";
    return "Very Weak";
}

function formatReport(report) {
    let output = "";
    
    output += "═══════════════════════════════════════════════════════════════\n";
    output += "              SOL CATAMM MULTI-GAME ANALYSIS REPORT\n";
    output += "═══════════════════════════════════════════════════════════════\n\n";
    
    output += `📊 SUMMARY (${report.meta.totalGames} Games Analyzed)\n`;
    output += "─".repeat(50) + "\n";
    output += `• Average Game Length: ${report.summary.averageTurnsPerGame} turns\n`;
    output += `• Average Winner VP: ${report.summary.averageWinnerVP}\n`;
    output += `• Game Balance: ${report.summary.gameBalance.isBalanced ? "✅ BALANCED" : "⚠️  IMBALANCED"} (spread: ${report.summary.gameBalance.spread})\n\n`;
    
    output += "🏆 PLAYER WIN RATES:\n";
    report.summary.playerWinRates.forEach(p => {
        output += `   Player ${p.playerId}: ${p.wins} wins (${p.winRate})\n`;
    });
    output += `   🥇 Most Successful: Player ${report.summary.mostSuccessfulPlayer}\n\n`;
    
    output += "⚔️ GAME END ANALYSIS:\n";
    Object.entries(report.summary.gameEndReasons).forEach(([reason, count]) => {
        output += `   ${reason}: ${count} games\n`;
    });
    output += "\n";
    
    output += "👥 DETAILED PLAYER ANALYSIS\n";
    output += "─".repeat(50) + "\n";
    for (let i = 0; i < 4; i++) {
        const player = report.playerAnalysis[`player${i}`];
        output += `Player ${i}:\n`;
        output += `   🏆 Wins: ${player.gamesWon} | Avg VP: ${player.averageVP} | SOL Efficiency: ${player.solEfficiency} VP/SOL\n`;
        output += `   🏠 Buildings: ${player.averageBuildings.settlements}S ${player.averageBuildings.cities}C ${player.averageBuildings.roads}R\n`;
        output += `   ⚔️ Knights: ${player.averageKnightsPlayed} | Dev Cards: ${player.averageDevCards}\n`;
        output += `   🎖️ Special: ${player.specialAchievements.largestArmyWins} Army + ${player.specialAchievements.longestRoadWins} Road\n`;
        output += `   💰 Avg SOL Spent: ${player.averageSOLSpent}\n\n`;
    }
    
    output += "📈 GAME METRICS\n";
    output += "─".repeat(50) + "\n";
    output += "Game Length Distribution:\n";
    output += `   ${report.gameMetrics.gameLengthDistribution.short}\n`;
    output += `   ${report.gameMetrics.gameLengthDistribution.medium}\n`;
    output += `   ${report.gameMetrics.gameLengthDistribution.long}\n\n`;
    
    output += "Competitiveness:\n";
    output += `   Close Games (≤2 VP difference): ${report.gameMetrics.competitiveness.closeGames} (${report.gameMetrics.competitiveness.closeGamePercentage})\n`;
    output += `   Blowout Games: ${report.gameMetrics.competitiveness.blowouts}\n\n`;
    
    output += "Victory Points:\n";
    output += `   Range: ${report.gameMetrics.victoryPointRange.lowest}-${report.gameMetrics.victoryPointRange.highest} VP\n`;
    output += `   Most Common: ${report.gameMetrics.victoryPointRange.mostCommon} VP\n\n`;
    
    output += "🎯 STRATEGIC INSIGHTS\n";
    output += "─".repeat(50) + "\n";
    output += "Special Card Effectiveness:\n";
    output += `   Largest Army: ${report.strategicInsights.specialCardEffectiveness.largestArmyGames} games, ${report.strategicInsights.specialCardEffectiveness.largestArmyWinRate} win rate\n`;
    output += `   Longest Road: ${report.strategicInsights.specialCardEffectiveness.longestRoadGames} games, ${report.strategicInsights.specialCardEffectiveness.longestRoadWinRate} win rate\n\n`;
    
    output += "Building Strategies:\n";
    output += `   Settlement:City Ratio: ${report.strategicInsights.buildingStrategies.averageSettlementToCityRatio}\n`;
    output += `   Roads per Building: ${report.strategicInsights.buildingStrategies.averageRoadsPerBuilding}\n\n`;
    
    output += "Development Cards:\n";
    output += `   Avg Knights Played: ${report.strategicInsights.developmentCardUsage.averageKnightsPerPlayer}\n`;
    output += `   Avg Dev Cards Held: ${report.strategicInsights.developmentCardUsage.averageDevCardsHeld}\n\n`;
    
    output += "💰 ECONOMIC ANALYSIS\n";
    output += "─".repeat(50) + "\n";
    output += "SOL Spending Statistics:\n";
    output += `   Total SOL Spent: ${report.economicAnalysis.solSpendingStats.totalSOLSpent}\n`;
    output += `   Average per Player: ${report.economicAnalysis.solSpendingStats.averageSOLPerPlayer} SOL\n`;
    output += `   Range: ${report.economicAnalysis.solSpendingStats.lowestSpender} - ${report.economicAnalysis.solSpendingStats.highestSpender} SOL\n\n`;
    
    output += "Spending Efficiency:\n";
    output += `   SOL-to-VP Correlation: ${report.economicAnalysis.spendingEfficiency.solToVPCorrelation} (${report.economicAnalysis.spendingEfficiency.correlationStrength})\n`;
    output += `   High Spenders Avg VP: ${report.economicAnalysis.spendingEfficiency.highSpendersAvgVP}\n`;
    output += `   Low Spenders Avg VP: ${report.economicAnalysis.spendingEfficiency.lowSpendersAvgVP}\n\n`;
    
    // ENHANCED: AMM Market Analysis Section
    if (report.ammMarketAnalysis && report.ammMarketAnalysis.tradingActivity) {
        output += "📊 AMM MARKET ANALYSIS\n";
        output += "─".repeat(50) + "\n";
        
        const amm = report.ammMarketAnalysis;
        
        output += "Trading Volume & Activity:\n";
        output += `   Total Volume Across Games: ${amm.tradingActivity.totalGameVolume.toFixed(0)} SOL\n`;
        output += `   Most Traded: ${amm.tradingActivity.mostTradedMarket} (${amm.tradingActivity.totalVolumeByMarket[amm.tradingActivity.mostTradedMarket].toFixed(0)} SOL)\n`;
        output += `   Least Traded: ${amm.tradingActivity.leastTradedMarket} (${amm.tradingActivity.totalVolumeByMarket[amm.tradingActivity.leastTradedMarket].toFixed(0)} SOL)\n`;
        output += `   Avg Transaction Size: ${amm.tradingActivity.avgTransactionSize} SOL\n`;
        
        output += "\nMarket Utilization by Resource:\n";
        const resources = ['wood', 'brick', 'sheep', 'wheat', 'ore'];
        resources.forEach(resource => {
            const analytics = amm.tradingActivity.marketAnalytics[resource];
            output += `   ${resource}: ${analytics.avgVolume.toFixed(0)} SOL/game, ${analytics.avgTransactions.toFixed(1)} tx/game (${analytics.utilization})\n`;
        });
        
        output += "\nPrice Dynamics:\n";
        output += `   Market Volatility: ${amm.priceAnalysis.avgVolatility}% (${amm.priceAnalysis.priceStability})\n`;
        resources.forEach(resource => {
            const change = parseFloat(amm.priceAnalysis.averagePriceChanges[resource]);
            const direction = change > 0 ? "📈" : change < 0 ? "📉" : "➡️";
            output += `   ${resource}: ${direction} ${change > 0 ? '+' : ''}${change}% avg change\n`;
        });
        
        output += "\nMarket Efficiency:\n";
        output += `   Overall Efficiency: ${amm.marketEfficiency.overallEfficiency}\n`;
        output += `   Efficient Markets: ${amm.marketEfficiency.efficientMarkets.join(', ') || 'None'}\n`;
        output += `   High Utilization: ${amm.tradingActivity.highUtilizationMarkets.join(', ') || 'None'}\n`;
        
        // Ghost Ship Analysis (if available)
        if (amm.ghostShipAnalysis) {
            output += "\nGhost Ship Impact:\n";
            output += `   Avg Moves/Game: ${amm.ghostShipAnalysis.avgMovesPerGame}\n`;
            output += `   Market Blocking Rate: ${amm.ghostShipAnalysis.marketBlockingRate}\n`;
            output += `   Most Targeted: ${amm.ghostShipAnalysis.mostTargetedMarket}\n`;
            output += `   Strategic Impact: ${amm.ghostShipAnalysis.strategicImpact}\n`;
        }
        
        output += "\nMarket Health Assessment:\n";
        output += `   Usage Level: ${amm.marketHealth.usageLevel}\n`;
        output += `   Player Engagement: ${amm.marketHealth.playerEngagement}\n`;
        output += `   Market Maturity: ${amm.marketHealth.marketMaturity}\n`;
        output += `   Liquidity Depth: ${amm.marketHealth.liquidityDepth}\n`;
        
        output += "\nStrategic Market Insights:\n";
        output += `   Dominant Strategy: ${amm.strategicInsights.dominantStrategy}\n`;
        output += `   Pattern: ${amm.strategicInsights.emergingPatterns}\n`;
        output += `   Focus Recommendation: ${amm.strategicInsights.recommendedFocus}\n`;
        
        if (amm.strategicInsights.resourceBottlenecks && amm.strategicInsights.resourceBottlenecks.length > 0) {
            output += `   Resource Bottlenecks: ${amm.strategicInsights.resourceBottlenecks.join(', ')}\n`;
        }
        
        output += "\n";
    }
    
    output += "💡 STRATEGIC RECOMMENDATIONS:\n";
    output += `   Optimal SOL Range: ${report.economicAnalysis.economicStrategy.recommendedSpendingRange}\n`;
    output += `   Strategy: ${report.economicAnalysis.economicStrategy.optimalSpendingThreshold}\n`;
    
    if (report.ammMarketAnalysis && report.ammMarketAnalysis.strategicInsights) {
        const amm = report.ammMarketAnalysis.strategicInsights;
        if (amm.liquidityProvisionIncentive === "Strong") {
            output += `   💡 Strong incentive for liquidity provision detected\n`;
        }
        if (amm.marketManipulationRisk === "High") {
            output += `   ⚠️ High market manipulation risk - consider intervention mechanisms\n`;
        }
        if (amm.pirateUtilityRating === "High") {
            output += `   ✅ Pirate market blocking is strategically valuable\n`;
        }
    }
    output += "\n";
    
    output += "═".repeat(65) + "\n";
    output += `Report generated: ${new Date(report.meta.reportGenerated).toLocaleString()}\n`;
    output += "═".repeat(65) + "\n";
    
    return output;
}

// Example usage function that demonstrates how to use this with game data
function runAnalysisExample(gameResults) {
    console.log("🔄 Analyzing game results...");
    const report = generateComprehensiveReport(gameResults);
    const formattedReport = formatReport(report);
    
    console.log(formattedReport);
    
    // Return both raw data and formatted report for flexibility
    return {
        rawReport: report,
        formattedReport: formattedReport,
        summary: {
            totalGames: report.meta.totalGames,
            isBalanced: report.summary.gameBalance.isBalanced,
            mostSuccessfulPlayer: report.summary.mostSuccessfulPlayer,
            averageGameLength: report.summary.averageTurnsPerGame,
            competitivenessRating: report.gameMetrics.competitiveness.closeGamePercentage
        }
    };
}

// Additional utility functions for extended analysis
function comparePlayerStrategies(report) {
    const players = Object.values(report.playerAnalysis);
    
    return {
        mostEfficient: players.reduce((prev, current) => 
            prev.solEfficiency > current.solEfficiency ? prev : current),
        mostAggressive: players.reduce((prev, current) => 
            prev.averageSOLSpent > current.averageSOLSpent ? prev : current),
        bestBuilder: players.reduce((prev, current) => 
            (prev.averageBuildings.settlements + prev.averageBuildings.cities) > 
            (current.averageBuildings.settlements + current.averageBuildings.cities) ? prev : current),
        roadSpecialist: players.reduce((prev, current) => 
            prev.averageBuildings.roads > current.averageBuildings.roads ? prev : current),
        armyLeader: players.reduce((prev, current) => 
            prev.averageKnightsPlayed > current.averageKnightsPlayed ? prev : current)
    };
}

function generateGameBalanceReport(gameResults) {
    const winDistribution = [0, 1, 2, 3].map(playerId => 
        gameResults.filter(g => g.winner === playerId).length);
    
    const maxWins = Math.max(...winDistribution);
    const minWins = Math.min(...winDistribution);
    const spread = maxWins - minWins;
    
    const balanceScore = Math.max(0, 100 - (spread * 20)); // 100% if perfect, decreases by 20% per win difference
    
    return {
        winDistribution,
        spread,
        balanceScore,
        rating: balanceScore >= 80 ? "Excellent" : 
                balanceScore >= 60 ? "Good" : 
                balanceScore >= 40 ? "Fair" : "Poor",
        isBalanced: spread <= 2
    };
}