// Hex Edge Direction Visualization
// Shows each hex with its 6 edges labeled with compass directions

class HexEdgeBoard {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.hexRadius = 60; // Larger for better label visibility
        this.centerX = canvas.width / 2;
        this.centerY = canvas.height / 2;
        
        this.showEdgeLabels = true;
        this.showHexNumbers = true;
        
        this.hexes = [];
        
        this.generateBoard();
    }
    
    generateBoard() {
        this.hexes = [];
        this.generateHexPositions();
        this.draw();
    }
    
    generateHexPositions() {
        const hexWidth = this.hexRadius * Math.sqrt(3);
        const hexHeight = this.hexRadius * 2;
        const rowSpacing = hexHeight * 0.75; // This creates the honeycomb overlap
        
        // Create hex positions using axial coordinates
        // This ensures proper honeycomb interlocking
        
        // Define hexes by their axial coordinates (q, r)
        // Adjusted for proper symmetrical Catan board shape
        const hexCoords = [
            // Row 0 (top): 3 hexes
            {q: 0, r: -2}, {q: 1, r: -2}, {q: 2, r: -2},     // 0, 1, 2
            // Row 1: 4 hexes  
            {q: -1, r: -1}, {q: 0, r: -1}, {q: 1, r: -1}, {q: 2, r: -1},    // 3, 4, 5, 6
            // Row 2 (middle): 5 hexes
            {q: -2, r: 0}, {q: -1, r: 0}, {q: 0, r: 0}, {q: 1, r: 0}, {q: 2, r: 0},  // 7, 8, 9, 10, 11
            // Row 3: 4 hexes
            {q: -2, r: 1}, {q: -1, r: 1}, {q: 0, r: 1}, {q: 1, r: 1},    // 12, 13, 14, 15
            // Row 4 (bottom): 3 hexes
            {q: -2, r: 2}, {q: -1, r: 2}, {q: 0, r: 2}      // 16, 17, 18
        ];
        
        // Convert axial to pixel coordinates
        hexCoords.forEach((coord, index) => {
            // Axial to pixel conversion for flat-top hexagons
            const x = this.hexRadius * Math.sqrt(3) * (coord.q + coord.r / 2);
            const y = this.hexRadius * 3/2 * coord.r;
            
            this.hexes[index] = {
                x: this.centerX + x,
                y: this.centerY + y,
                index: index,
                q: coord.q,
                r: coord.r
            };
        });
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#f8f8f8';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw all hexes
        this.hexes.forEach(hex => this.drawHex(hex));
    }
    
    drawHex(hex) {
        const { x, y, index } = hex;
        
        // Define the 6 vertices of the hexagon
        // Starting from the top vertex and going clockwise
        const vertices = [];
        for (let i = 0; i < 6; i++) {
            // Start from top (90 degrees) and go clockwise
            const angle = (Math.PI / 2) - (i * Math.PI / 3);
            vertices.push({
                x: x + this.hexRadius * Math.cos(angle),
                y: y - this.hexRadius * Math.sin(angle) // Subtract for correct screen coordinates
            });
        }
        
        // Draw hexagon
        this.ctx.beginPath();
        vertices.forEach((vertex, i) => {
            if (i === 0) {
                this.ctx.moveTo(vertex.x, vertex.y);
            } else {
                this.ctx.lineTo(vertex.x, vertex.y);
            }
        });
        this.ctx.closePath();
        
        // Fill with light color
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fill();
        
        // Draw border
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Draw hex number in center
        if (this.showHexNumbers) {
            this.ctx.fillStyle = '#000';
            this.ctx.font = 'bold 28px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(index.toString(), x, y);
        }
        
        // Draw edge labels (only for outer edges)
        if (this.showEdgeLabels) {
            this.drawEdgeLabels(x, y, vertices, index);
        }
    }
    
    drawEdgeLabels(centerX, centerY, vertices, hexIndex) {
        // Define which edges are outer edges for each hex
        const outerEdges = {
            // Top row
            0: ['NW', 'NE', 'E'],
            1: ['NW', 'NE'],
            2: ['NW', 'NE', 'E'],
            
            // Second row
            3: ['W', 'NW'],
            4: [],  // No outer edges
            5: [],  // No outer edges
            6: ['NE', 'E'],
            
            // Middle row
            7: ['W', 'SW'],
            8: [],  // No outer edges
            9: [],  // No outer edges
            10: [], // No outer edges
            11: ['E', 'SE'],
            
            // Fourth row
            12: ['W', 'SW'],
            13: [],  // No outer edges
            14: [],  // No outer edges
            15: ['E', 'SE'],
            
            // Bottom row
            16: ['W', 'SW', 'SE'],
            17: ['SW', 'SE'],
            18: ['SW', 'SE', 'E']
        };
        
        // Edge directions in order (matching the vertices)
        const edgeLabels = [
            { v1: 0, v2: 1, label: 'NE' },
            { v1: 1, v2: 2, label: 'E' },
            { v1: 2, v2: 3, label: 'SE' },
            { v1: 3, v2: 4, label: 'SW' },
            { v1: 4, v2: 5, label: 'W' },
            { v1: 5, v2: 0, label: 'NW' }
        ];
        
        // Get outer edges for this hex
        const hexOuterEdges = outerEdges[hexIndex] || [];
        
        this.ctx.font = 'bold 12px Arial';
        this.ctx.fillStyle = '#ff0000';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        edgeLabels.forEach(edge => {
            // Only draw if this is an outer edge
            if (!hexOuterEdges.includes(edge.label)) {
                return;
            }
            
            // Calculate midpoint of edge
            const midX = (vertices[edge.v1].x + vertices[edge.v2].x) / 2;
            const midY = (vertices[edge.v1].y + vertices[edge.v2].y) / 2;
            
            // Calculate direction from center to edge midpoint
            const dx = midX - centerX;
            const dy = midY - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Position label slightly outside the edge
            const labelX = centerX + (dx / distance) * (this.hexRadius * 1.1);
            const labelY = centerY + (dy / distance) * (this.hexRadius * 1.1);
            
            // Draw background for better readability
            this.ctx.save();
            this.ctx.fillStyle = 'white';
            this.ctx.fillRect(labelX - 12, labelY - 8, 24, 16);
            this.ctx.restore();
            
            // Draw label
            this.ctx.fillText(edge.label, labelX, labelY);
        });
    }
}

// Initialize board
let board;

function toggleEdgeLabels() {
    board.showEdgeLabels = !board.showEdgeLabels;
    board.draw();
}

function toggleHexNumbers() {
    board.showHexNumbers = !board.showHexNumbers;
    board.draw();
}

window.onload = () => {
    const canvas = document.getElementById('board');
    board = new HexEdgeBoard(canvas);
};