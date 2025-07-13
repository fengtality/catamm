import { initializeBoard, getPerimeterEdges, getPerimeterVertices } from '../src/models/board.initialization';
import { HEX_EDGES } from '../src/models/board.models';

const board = initializeBoard();

console.log('CATAMM Board Verification');
console.log('========================\n');

console.log('Board Statistics:');
console.log(`- Total hexes: ${board.hexes.length}`);
console.log(`- Global vertices: ${board.globalVertices.size}`);
console.log(`- Global edges: ${board.globalEdges.size}`);
console.log(`- Perimeter edges: ${getPerimeterEdges(board).length}`);
console.log(`- Perimeter vertices: ${getPerimeterVertices(board).length}`);
console.log(`- Ports: ${board.ports.length}`);

// Verify hex numbering pattern
console.log('\nHex Numbering (Center = 0, clockwise from East):');
const centerHex = board.hexes[0];
console.log(`- Center hex (0): q=${centerHex.coordinates.q}, r=${centerHex.coordinates.r}`);
const eastHex = board.hexes[1];
console.log(`- East hex (1): q=${eastHex.coordinates.q}, r=${eastHex.coordinates.r}`);

// Verify vertex-based edges
console.log('\nVertex-Based Edge System:');
console.log('- Each hex has 6 vertices numbered 0-5 (0 at top)');
console.log('- Edges are represented as vertex pairs:');
HEX_EDGES.forEach((edge, i) => {
  console.log(`  Edge ${i}: [${edge[0]}, ${edge[1]}]`);
});

// Check shared vertices
console.log('\nShared Vertex Analysis:');
let sharedBy1 = 0, sharedBy2 = 0, sharedBy3 = 0;
board.globalVertices.forEach(vertex => {
  if (vertex.hexes.length === 1) sharedBy1++;
  else if (vertex.hexes.length === 2) sharedBy2++;
  else if (vertex.hexes.length === 3) sharedBy3++;
});
console.log(`- Vertices shared by 1 hex: ${sharedBy1}`);
console.log(`- Vertices shared by 2 hexes: ${sharedBy2}`);
console.log(`- Vertices shared by 3 hexes: ${sharedBy3}`);

// Check shared edges
console.log('\nShared Edge Analysis:');
let edgesBy1 = 0, edgesBy2 = 0;
board.globalEdges.forEach(edge => {
  if (edge.hexes.length === 1) edgesBy1++;
  else if (edge.hexes.length === 2) edgesBy2++;
});
console.log(`- Edges shared by 1 hex (perimeter): ${edgesBy1}`);
console.log(`- Edges shared by 2 hexes (interior): ${edgesBy2}`);

// Verify the robber
const robberHex = board.hexes.find(h => h.hasRobber);
console.log(`\nRobber location: Hex ${robberHex?.index} (${robberHex?.resource || 'Desert'})`);

// Resource distribution
console.log('\nResource Distribution:');
const resourceCounts = new Map<string, number>();
board.hexes.forEach(hex => {
  const resource = hex.resource || 'Desert';
  resourceCounts.set(resource, (resourceCounts.get(resource) || 0) + 1);
});
resourceCounts.forEach((count, resource) => {
  console.log(`- ${resource}: ${count}`);
});

// Number token distribution
console.log('\nNumber Token Distribution:');
const numberCounts = new Map<number, number>();
board.hexes.forEach(hex => {
  if (hex.numberToken) {
    numberCounts.set(hex.numberToken, (numberCounts.get(hex.numberToken) || 0) + 1);
  }
});

// Sort and display number counts
const sortedNumbers = Array.from(numberCounts.entries()).sort((a, b) => a[0] - b[0]);
sortedNumbers.forEach(([num, count]) => {
  const isRed = num === 6 || num === 8 ? ' (RED)' : '';
  console.log(`- ${num}${isRed}: ${count} tokens`);
});

console.log('\nNumber Token Placement Order:');
board.hexes.forEach(hex => {
  if (hex.numberToken) {
    console.log(`Hex ${hex.index}: ${hex.numberToken} on ${hex.resource || 'Desert'}`);
  }
});

console.log('\n✅ Board model initialized successfully with vertex-based system!');