// Catan Board Setup Module
// Provides functions to initialize a standard Catan board with proper hex positioning

/**
 * Initialize a standard Catan board with 19 hexes in the 3-4-5-4-3 pattern
 * @param {number} hexRadius - The radius of each hexagon
 * @param {number} centerX - X coordinate of the board center
 * @param {number} centerY - Y coordinate of the board center
 * @returns {Object} Board data including hex positions, edges, and neighbor information
 */
function initializeCatanBoard(hexRadius = 50, centerX = 400, centerY = 350) {
    const board = {
        hexRadius,
        centerX,
        centerY,
        hexes: [],
        edges: [],
        vertices: [],
        perimeter: {}
    };
    
    // Define hexes by their axial coordinates (q, r) for proper symmetrical layout
    const hexCoords = [
        // Row 0 (top): 3 hexes
        {q: 0, r: -2, row: 0, col: 0}, {q: 1, r: -2, row: 0, col: 1}, {q: 2, r: -2, row: 0, col: 2},
        // Row 1: 4 hexes  
        {q: -1, r: -1, row: 1, col: 0}, {q: 0, r: -1, row: 1, col: 1}, {q: 1, r: -1, row: 1, col: 2}, {q: 2, r: -1, row: 1, col: 3},
        // Row 2 (middle): 5 hexes
        {q: -2, r: 0, row: 2, col: 0}, {q: -1, r: 0, row: 2, col: 1}, {q: 0, r: 0, row: 2, col: 2}, {q: 1, r: 0, row: 2, col: 3}, {q: 2, r: 0, row: 2, col: 4},
        // Row 3: 4 hexes
        {q: -2, r: 1, row: 3, col: 0}, {q: -1, r: 1, row: 3, col: 1}, {q: 0, r: 1, row: 3, col: 2}, {q: 1, r: 1, row: 3, col: 3},
        // Row 4 (bottom): 3 hexes
        {q: -2, r: 2, row: 4, col: 0}, {q: -1, r: 2, row: 4, col: 1}, {q: 0, r: 2, row: 4, col: 2}
    ];
    
    // Convert axial to pixel coordinates and create hex objects
    hexCoords.forEach((coord, index) => {
        // Axial to pixel conversion for flat-top hexagons
        const x = hexRadius * Math.sqrt(3) * (coord.q + coord.r / 2);
        const y = hexRadius * 3/2 * coord.r;
        
        // Calculate vertices for this hex
        const vertices = [];
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 2) - (i * Math.PI / 3);
            vertices.push({
                x: centerX + x + hexRadius * Math.cos(angle),
                y: centerY + y - hexRadius * Math.sin(angle),
                angle: angle
            });
        }
        
        const hex = {
            index: index,
            x: centerX + x,
            y: centerY + y,
            q: coord.q,
            r: coord.r,
            row: coord.row,
            col: coord.col,
            vertices: vertices,
            edges: getHexEdges(index),
            neighbors: getHexNeighbors(index),
            isPerimeter: isPerimeterHex(index)
        };
        
        board.hexes.push(hex);
    });
    
    // Calculate perimeter edges
    board.perimeter = calculatePerimeterEdges(board.hexes);
    
    return board;
}

/**
 * Get the edge directions for a hex
 * @param {number} hexIndex - The hex index (0-18)
 * @returns {Object} Object with edge directions and their properties
 */
function getHexEdges(hexIndex) {
    // All hexes have these 6 edges
    const allEdges = ['N', 'NE', 'E', 'SE', 'SW', 'W', 'NW'];
    
    // Define which edges are on the perimeter for each hex
    const perimeterEdges = {
        // Top row
        0: ['NW', 'N', 'NE'],
        1: ['N', 'NE'],
        2: ['N', 'NE', 'E'],
        // Second row
        3: ['W', 'NW'],
        4: [],  // No perimeter edges
        5: [],  // No perimeter edges
        6: ['NE', 'E'],
        // Middle row
        7: ['W', 'SW'],
        8: [],  // No perimeter edges
        9: [],  // No perimeter edges
        10: [], // No perimeter edges
        11: ['E', 'SE'],
        // Fourth row
        12: ['W', 'SW'],
        13: [],  // No perimeter edges
        14: [],  // No perimeter edges
        15: ['E', 'SE'],
        // Bottom row
        16: ['W', 'SW', 'S'],
        17: ['SW', 'S', 'SE'],
        18: ['S', 'SE', 'E']
    };
    
    const edges = {};
    allEdges.forEach(edge => {
        edges[edge] = {
            direction: edge,
            isPerimeter: perimeterEdges[hexIndex].includes(edge)
        };
    });
    
    return edges;
}

/**
 * Get the neighboring hexes for a given hex
 * @param {number} hexIndex - The hex index (0-18)
 * @returns {Object} Object mapping directions to neighbor hex indices
 */
function getHexNeighbors(hexIndex) {
    // Define neighbor relationships
    const neighborMap = {
        0: { E: 1, SE: 4, SW: 3 },
        1: { W: 0, E: 2, SW: 4, SE: 5 },
        2: { W: 1, SW: 5, SE: 6 },
        3: { NE: 0, E: 4, SE: 8, SW: 7 },
        4: { W: 3, NW: 0, NE: 1, E: 5, SE: 9, SW: 8 },
        5: { W: 4, NW: 1, NE: 2, E: 6, SE: 10, SW: 9 },
        6: { W: 5, NW: 2, SW: 10, SE: 11 },
        7: { NE: 3, E: 8, SE: 12 },
        8: { W: 7, NW: 3, NE: 4, E: 9, SE: 13, SW: 12 },
        9: { W: 8, NW: 4, NE: 5, E: 10, SE: 14, SW: 13 },
        10: { W: 9, NW: 5, NE: 6, E: 11, SE: 15, SW: 14 },
        11: { W: 10, NW: 6, SW: 15 },
        12: { NE: 8, NW: 7, E: 13, SE: 16 },
        13: { W: 12, NW: 8, NE: 9, E: 14, SE: 17, SW: 16 },
        14: { W: 13, NW: 9, NE: 10, E: 15, SE: 18, SW: 17 },
        15: { W: 14, NW: 10, NE: 11, SW: 18 },
        16: { NE: 13, NW: 12, E: 17 },
        17: { W: 16, NW: 13, NE: 14, E: 18 },
        18: { W: 17, NW: 14, NE: 15 }
    };
    
    return neighborMap[hexIndex] || {};
}

/**
 * Check if a hex is on the perimeter
 * @param {number} hexIndex - The hex index (0-18)
 * @returns {boolean} True if the hex is on the perimeter
 */
function isPerimeterHex(hexIndex) {
    const perimeterHexes = [0, 1, 2, 3, 6, 7, 11, 12, 15, 16, 17, 18];
    return perimeterHexes.includes(hexIndex);
}

/**
 * Calculate all perimeter edges with their positions
 * @param {Array} hexes - Array of hex objects
 * @returns {Array} Array of perimeter edge objects
 */
function calculatePerimeterEdges(hexes) {
    const perimeterEdges = [];
    let edgeIndex = 0;
    
    // Define the perimeter edges in order (clockwise from top)
    const edgeSequence = [
        {hex: 0, edge: 'NW'}, {hex: 0, edge: 'N'}, {hex: 1, edge: 'N'}, 
        {hex: 1, edge: 'NE'}, {hex: 2, edge: 'N'}, {hex: 2, edge: 'NE'},
        {hex: 2, edge: 'E'}, {hex: 6, edge: 'NE'}, {hex: 6, edge: 'E'},
        {hex: 11, edge: 'E'}, {hex: 11, edge: 'SE'}, {hex: 15, edge: 'E'},
        {hex: 15, edge: 'SE'}, {hex: 18, edge: 'E'}, {hex: 18, edge: 'SE'},
        {hex: 18, edge: 'S'}, {hex: 17, edge: 'SE'}, {hex: 17, edge: 'S'},
        {hex: 17, edge: 'SW'}, {hex: 16, edge: 'S'}, {hex: 16, edge: 'SW'},
        {hex: 16, edge: 'W'}, {hex: 12, edge: 'SW'}, {hex: 12, edge: 'W'},
        {hex: 7, edge: 'W'}, {hex: 7, edge: 'SW'}, {hex: 3, edge: 'W'},
        {hex: 3, edge: 'NW'}, {hex: 0, edge: 'W'}
    ];
    
    edgeSequence.forEach((edge, index) => {
        const hex = hexes[edge.hex];
        const edgeDir = edge.edge;
        
        perimeterEdges.push({
            index: index,
            hexIndex: edge.hex,
            edge: edgeDir,
            position: getEdgePosition(hex, edgeDir)
        });
    });
    
    return perimeterEdges;
}

/**
 * Get the position of an edge for a hex
 * @param {Object} hex - The hex object
 * @param {string} edgeDir - The edge direction (N, NE, E, SE, SW, W, NW)
 * @returns {Object} Object with start and end positions of the edge
 */
function getEdgePosition(hex, edgeDir) {
    const edgeVertexMap = {
        'N': [0, 1],
        'NE': [1, 2],
        'E': [2, 3],
        'SE': [3, 4],
        'SW': [4, 5],
        'W': [5, 0],
        'NW': [0, 5]  // Note: This needs to wrap around
    };
    
    const vertexIndices = edgeVertexMap[edgeDir];
    const v1 = hex.vertices[vertexIndices[0]];
    const v2 = hex.vertices[vertexIndices[1]];
    
    return {
        start: { x: v1.x, y: v1.y },
        end: { x: v2.x, y: v2.y },
        midpoint: { 
            x: (v1.x + v2.x) / 2, 
            y: (v1.y + v2.y) / 2 
        }
    };
}

/**
 * Get port placement positions based on the board
 * @param {Object} board - The board object from initializeCatanBoard
 * @returns {Array} Array of port placement objects
 */
function getPortPlacements(board) {
    const ports = [
        // Port 1: NW edge of hex 0
        { 
            id: 1,
            hexes: [{hex: 0, edge: 'NW'}],
            type: 'single',
            perimeterEdges: [0]
        },
        // Port 2: Between NE edge of hex 1 and NW edge of hex 2
        { 
            id: 2,
            hexes: [{hex: 1, edge: 'NE'}, {hex: 2, edge: 'NW'}],
            type: 'double',
            perimeterEdges: [3, 4]
        },
        // Port 3: Between E edge of hex 2 and NE edge of hex 6
        { 
            id: 3,
            hexes: [{hex: 2, edge: 'E'}, {hex: 6, edge: 'NE'}],
            type: 'double',
            perimeterEdges: [6, 7]
        },
        // Port 4: Between SE edge of hex 11 and E edge of hex 15
        { 
            id: 4,
            hexes: [{hex: 11, edge: 'SE'}, {hex: 15, edge: 'E'}],
            type: 'double',
            perimeterEdges: [10, 11]
        },
        // Port 5: SE edge of hex 18
        { 
            id: 5,
            hexes: [{hex: 18, edge: 'SE'}],
            type: 'single',
            perimeterEdges: [14]
        },
        // Port 6: Between SW edge of hex 17 and SE edge of hex 16
        { 
            id: 6,
            hexes: [{hex: 17, edge: 'SW'}, {hex: 16, edge: 'SE'}],
            type: 'double',
            perimeterEdges: [18, 19]
        },
        // Port 7: Between W edge of hex 16 and SW edge of hex 12
        { 
            id: 7,
            hexes: [{hex: 16, edge: 'W'}, {hex: 12, edge: 'SW'}],
            type: 'double',
            perimeterEdges: [21, 22]
        },
        // Port 8: Between NW edge of hex 7 and W edge of hex 3
        { 
            id: 8,
            hexes: [{hex: 7, edge: 'NW'}, {hex: 3, edge: 'W'}],
            type: 'double',
            perimeterEdges: [25, 26]
        },
        // Port 9: NW edge of hex 3
        { 
            id: 9,
            hexes: [{hex: 3, edge: 'NW'}],
            type: 'single',
            perimeterEdges: [27]
        }
    ];
    
    // Calculate actual positions for each port
    ports.forEach(port => {
        const positions = port.hexes.map(h => {
            const hex = board.hexes[h.hex];
            return getEdgePosition(hex, h.edge);
        });
        
        if (port.type === 'single') {
            port.position = positions[0].midpoint;
        } else {
            // For double edge ports, find the midpoint between the two edge midpoints
            port.position = {
                x: (positions[0].midpoint.x + positions[1].midpoint.x) / 2,
                y: (positions[0].midpoint.y + positions[1].midpoint.y) / 2
            };
        }
    });
    
    return ports;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeCatanBoard,
        getPortPlacements,
        getHexEdges,
        getHexNeighbors,
        isPerimeterHex
    };
}