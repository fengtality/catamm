// Goldberg Polyhedron GP(1,4) initialization
// Based on geodesic subdivision of icosahedron

import {
  GoldbergBoard,
  Face,
  PentagonFace,
  HexagonFace,
  FaceType,
  Vertex3D,
  Edge3D,
  PENTAGON_COUNT,
  HEXAGON_COUNT,
  cartesianToSpherical,
  sphericalToCartesian,
  geodesicDistance
} from './goldberg.models';
import { Resource } from '@/types';

// Generate icosahedron vertices (12 vertices, 20 faces, 30 edges)
function generateIcosahedronVertices(): Vertex3D[] {
  const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio
  const a = 1 / Math.sqrt(phi * phi + 1); // Normalize to unit sphere
  const b = phi * a;
  
  // 12 vertices of icosahedron
  const vertices: Vertex3D[] = [
    // Top and bottom vertices
    { x: 0, y: 0, z: 1, theta: 0, phi: 0, id: 'v0' },
    { x: 0, y: 0, z: -1, theta: 0, phi: Math.PI, id: 'v1' },
    
    // Middle ring - alternating heights
    { x: b, y: 0, z: a, theta: 0, phi: 0, id: 'v2' },
    { x: a, y: b, z: a, theta: 0, phi: 0, id: 'v3' },
    { x: -a, y: b, z: a, theta: 0, phi: 0, id: 'v4' },
    { x: -b, y: 0, z: a, theta: 0, phi: 0, id: 'v5' },
    { x: -a, y: -b, z: a, theta: 0, phi: 0, id: 'v6' },
    { x: a, y: -b, z: a, theta: 0, phi: 0, id: 'v7' },
    
    { x: b, y: 0, z: -a, theta: 0, phi: 0, id: 'v8' },
    { x: a, y: -b, z: -a, theta: 0, phi: 0, id: 'v9' },
    { x: -a, y: -b, z: -a, theta: 0, phi: 0, id: 'v10' },
    { x: -b, y: 0, z: -a, theta: 0, phi: 0, id: 'v11' },
  ];
  
  // Normalize to unit sphere and calculate spherical coordinates
  vertices.forEach(v => {
    const length = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    v.x /= length;
    v.y /= length;
    v.z /= length;
    const spherical = cartesianToSpherical(v.x, v.y, v.z);
    v.theta = spherical.theta;
    v.phi = spherical.phi;
  });
  
  return vertices;
}

// Subdivide a triangular face for GP(1,4) pattern
// m=1, n=4 creates specific subdivision pattern
function subdivideTriangle(
  v1: Vertex3D,
  v2: Vertex3D,
  v3: Vertex3D,
  vertexMap: Map<string, Vertex3D>
): { vertices: Vertex3D[], faces: number[][] } {
  // For GP(1,4), we need to subdivide each triangle into smaller triangles
  // This creates the pattern that results in pentagons at original vertices
  // and hexagons elsewhere
  
  const vertices: Vertex3D[] = [];
  const faces: number[][] = [];
  
  // Create edge subdivision points
  const divisions = 5; // For GP(1,4)
  const edgePoints: Vertex3D[][] = [[], [], []];
  
  // Subdivide each edge
  const edges = [[v1, v2], [v2, v3], [v3, v1]];
  edges.forEach((edge, edgeIdx) => {
    for (let i = 1; i < divisions; i++) {
      const t = i / divisions;
      const x = edge[0].x * (1 - t) + edge[1].x * t;
      const y = edge[0].y * (1 - t) + edge[1].y * t;
      const z = edge[0].z * (1 - t) + edge[1].z * t;
      
      // Normalize to sphere surface
      const length = Math.sqrt(x * x + y * y + z * z);
      const normalized = {
        x: x / length,
        y: y / length,
        z: z / length,
        theta: 0,
        phi: 0,
        id: `e${edgeIdx}_${i}`
      };
      
      const spherical = cartesianToSpherical(normalized.x, normalized.y, normalized.z);
      normalized.theta = spherical.theta;
      normalized.phi = spherical.phi;
      
      edgePoints[edgeIdx].push(normalized);
      vertices.push(normalized);
    }
  });
  
  // Create interior points and faces
  // This is simplified - actual GP(1,4) generation is more complex
  // For now, we'll create a basic subdivision that approximates the structure
  
  return { vertices, faces };
}

// Initialize a Goldberg polyhedron GP(1,4)
export function initializeGoldbergBoard(): GoldbergBoard {
  const vertices = new Map<string, Vertex3D>();
  const edges = new Map<string, Edge3D>();
  const faces: Face[] = [];
  
  // Start with icosahedron
  const icosahedronVertices = generateIcosahedronVertices();
  
  // For GP(1,4), we need a specific subdivision pattern
  // This is a simplified version - actual implementation would use
  // Conway polyhedron notation or dual/snub operations
  
  // For initial board, only create a small subset of faces
  // Start with 1 pentagon and surrounding hexagons (like original Catan size)
  const INITIAL_HEXAGON_COUNT = 19; // Standard Catan board size
  const INITIAL_PENTAGON_COUNT = 1; // One central port
  
  // Create central pentagon
  const centralPentagon: PentagonFace = {
    id: 0,
    type: FaceType.Pentagon,
    vertexIds: [],
    neighbors: [],
    center: { x: 0, y: 0, z: 1, theta: 0, phi: 0, id: 'v0' }, // Top of sphere
    resource: null,
    numberToken: null,
    hasRobber: false,
    isPort: true,
  };
  faces.push(centralPentagon);
  
  // Create surrounding hexagons in rings
  let faceId = 1;
  
  // First ring around pentagon (5 hexagons)
  const ring1Radius = 0.18; // Tighter packing
  for (let i = 0; i < 5; i++) {
    const angle = (i * 2 * Math.PI) / 5;
    
    // Position on sphere
    const x = Math.sin(ring1Radius) * Math.cos(angle);
    const y = Math.sin(ring1Radius) * Math.sin(angle);
    const z = Math.cos(ring1Radius);
    
    const hexagon: HexagonFace = {
      id: faceId++,
      type: FaceType.Hexagon,
      vertexIds: [],
      neighbors: [],
      center: { x, y, z, theta: angle, phi: ring1Radius, id: `f${faceId}` },
      resource: null,
      numberToken: null,
      hasRobber: false
    };
    faces.push(hexagon);
  }
  
  // Second ring - alternating pattern (10 hexagons)
  const ring2Radius = 0.32;
  for (let i = 0; i < 10; i++) {
    const angle = (i * 2 * Math.PI) / 10 + Math.PI / 10; // Offset for hex packing
    
    const x = Math.sin(ring2Radius) * Math.cos(angle);
    const y = Math.sin(ring2Radius) * Math.sin(angle);
    const z = Math.cos(ring2Radius);
    
    const hexagon: HexagonFace = {
      id: faceId++,
      type: FaceType.Hexagon,
      vertexIds: [],
      neighbors: [],
      center: { x, y, z, theta: angle, phi: ring2Radius, id: `f${faceId}` },
      resource: null,
      numberToken: null,
      hasRobber: false
    };
    faces.push(hexagon);
  }
  
  // Outer edge hexagons to complete standard board
  const outerPositions = [
    { angle: 0, radius: 0.45 },
    { angle: Math.PI / 3, radius: 0.45 },
    { angle: 2 * Math.PI / 3, radius: 0.45 },
    { angle: Math.PI, radius: 0.45 }
  ];
  
  outerPositions.forEach(pos => {
    const x = Math.sin(pos.radius) * Math.cos(pos.angle);
    const y = Math.sin(pos.radius) * Math.sin(pos.angle);
    const z = Math.cos(pos.radius);
    
    const hexagon: HexagonFace = {
      id: faceId++,
      type: FaceType.Hexagon,
      vertexIds: [],
      neighbors: [],
      center: { x, y, z, theta: pos.angle, phi: pos.radius, id: `f${faceId}` },
      resource: null,
      numberToken: null,
      hasRobber: false
    };
    faces.push(hexagon);
  });
  
  // Assign resources and numbers
  assignResourcesAndNumbers(faces);
  
  // Find neighbors (simplified - just based on distance)
  findNeighbors(faces);
  
  // Generate vertices and edges for each face
  generateVerticesAndEdges(faces, vertices, edges);
  
  // Place robber on a random non-port face
  const nonPortFaces = faces.filter(f => f.type === FaceType.Hexagon);
  const robberLocation = nonPortFaces[Math.floor(Math.random() * nonPortFaces.length)].id;
  faces[robberLocation].hasRobber = true;
  
  return {
    vertices,
    edges,
    faces,
    buildings: new Map(),
    roads: new Map(),
    robberLocation
  };
}

// Assign resources and numbers to faces
function assignResourcesAndNumbers(faces: Face[]): void {
  const resources = [Resource.Wood, Resource.Brick, Resource.Sheep, Resource.Wheat, Resource.Ore];
  const hexagons = faces.filter(f => f.type === FaceType.Hexagon);
  
  // For standard Catan-size board (19 hexes)
  // Traditional distribution: 4 wood, 3 brick, 4 sheep, 4 wheat, 3 ore, 1 desert
  const resourceList: (Resource | null)[] = [
    ...Array(4).fill(Resource.Wood),
    ...Array(3).fill(Resource.Brick),
    ...Array(4).fill(Resource.Sheep),
    ...Array(4).fill(Resource.Wheat),
    ...Array(3).fill(Resource.Ore),
    null // Desert
  ];
  
  // Shuffle and assign
  for (let i = resourceList.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [resourceList[i], resourceList[j]] = [resourceList[j], resourceList[i]];
  }
  
  hexagons.forEach((hex, i) => {
    if (i < resourceList.length) {
      hex.resource = resourceList[i];
    }
  });
  
  // Standard Catan number distribution (no 7)
  const numberTokens = [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12];
  
  // Shuffle number tokens
  for (let i = numberTokens.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numberTokens[i], numberTokens[j]] = [numberTokens[j], numberTokens[i]];
  }
  
  // Assign to non-desert hexes
  let tokenIndex = 0;
  hexagons.filter(h => h.resource !== null).forEach(hex => {
    if (tokenIndex < numberTokens.length) {
      hex.numberToken = numberTokens[tokenIndex++];
    }
  });
  
  // Pentagons don't have resources or numbers (they're ports)
  faces.filter(f => f.type === FaceType.Pentagon).forEach(pentagon => {
    pentagon.resource = null;
    pentagon.numberToken = null;
  });
}

// Find neighboring faces based on geodesic distance
function findNeighbors(faces: Face[]): void {
  const neighborThreshold = 0.35; // Adjusted for tighter packing
  
  faces.forEach((face, i) => {
    const neighbors: number[] = [];
    
    faces.forEach((otherFace, j) => {
      if (i !== j) {
        const distance = geodesicDistance(face.center, otherFace.center);
        if (distance < neighborThreshold) {
          neighbors.push(j);
        }
      }
    });
    
    // Sort by distance and keep closest neighbors
    // Pentagons have 5 neighbors, hexagons have 6
    const maxNeighbors = face.type === FaceType.Pentagon ? 5 : 6;
    neighbors.sort((a, b) => {
      const distA = geodesicDistance(face.center, faces[a].center);
      const distB = geodesicDistance(face.center, faces[b].center);
      return distA - distB;
    });
    
    face.neighbors = neighbors.slice(0, maxNeighbors);
  });
}

// Generate vertices and edges for each face
function generateVerticesAndEdges(
  faces: Face[],
  vertices: Map<string, Vertex3D>,
  edges: Map<string, Edge3D>
): void {
  // This is a simplified implementation
  // In practice, you'd use proper geodesic subdivision
  
  faces.forEach(face => {
    const numVertices = face.type === FaceType.Pentagon ? 5 : 6;
    const angleStep = (2 * Math.PI) / numVertices;
    const radius = 0.1; // Small radius around face center
    
    // Generate vertices around face center
    for (let i = 0; i < numVertices; i++) {
      const angle = i * angleStep;
      
      // Create vertex slightly offset from center
      const offsetX = Math.cos(angle) * radius;
      const offsetY = Math.sin(angle) * radius;
      
      // Project onto sphere surface
      const x = face.center.x + offsetX * Math.cos(face.center.phi);
      const y = face.center.y + offsetY;
      const z = face.center.z - offsetX * Math.sin(face.center.phi);
      
      // Normalize to unit sphere
      const length = Math.sqrt(x * x + y * y + z * z);
      const vertex: Vertex3D = {
        id: `v_${face.id}_${i}`,
        x: x / length,
        y: y / length,
        z: z / length,
        theta: 0,
        phi: 0
      };
      
      const spherical = cartesianToSpherical(vertex.x, vertex.y, vertex.z);
      vertex.theta = spherical.theta;
      vertex.phi = spherical.phi;
      
      vertices.set(vertex.id, vertex);
      face.vertexIds.push(vertex.id);
      
      // Create edge to next vertex
      const nextI = (i + 1) % numVertices;
      const edgeId = `e_${face.id}_${i}_${nextI}`;
      edges.set(edgeId, {
        id: edgeId,
        vertexIds: [vertex.id, `v_${face.id}_${nextI}`]
      });
    }
  });
}

// Get pentagon neighbors for port configuration
export function getPentagonNeighbors(board: GoldbergBoard, pentagonId: number): Face[] {
  const pentagon = board.faces[pentagonId];
  if (!pentagon || pentagon.type !== FaceType.Pentagon) {
    return [];
  }
  
  return pentagon.neighbors
    .map(id => board.faces[id])
    .filter(face => face.type === FaceType.Hexagon);
}

// Configure a pentagon as a port with specific resources
export function configurePentagonPort(
  board: GoldbergBoard,
  pentagonId: number,
  resource1: Resource,
  resource2: Resource
): void {
  const pentagon = board.faces[pentagonId] as PentagonFace;
  if (!pentagon || pentagon.type !== FaceType.Pentagon) {
    return;
  }
  
  pentagon.portConfig = {
    resource1,
    resource2
  };
}