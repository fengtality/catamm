// Goldberg Polyhedron GP(1,4) models for CATAMM
// GP(1,4) has 12 pentagons and 180 hexagons (192 faces total)

import { Resource } from '@/types';

// Face types in the Goldberg polyhedron
export enum FaceType {
  Pentagon = 'pentagon',
  Hexagon = 'hexagon'
}

// Represents a vertex in 3D space (on unit sphere)
export interface Vertex3D {
  id: string;
  x: number;
  y: number;
  z: number;
  // Spherical coordinates
  theta: number; // azimuthal angle (0 to 2π)
  phi: number;   // polar angle (0 to π)
}

// Represents an edge between two vertices
export interface Edge3D {
  id: string;
  vertexIds: [string, string];
}

// Base interface for a face (pentagon or hexagon)
export interface Face {
  id: number;
  type: FaceType;
  vertexIds: string[]; // 5 for pentagon, 6 for hexagon
  neighbors: number[]; // indices of neighboring faces
  center: Vertex3D; // center point on sphere
  resource: Resource | null;
  numberToken: number | null;
  hasRobber: boolean;
}

// Pentagon face - used as a port for AMM trading
export interface PentagonFace extends Face {
  type: FaceType.Pentagon;
  vertexIds: string[]; // exactly 5
  // Port configuration
  isPort: boolean;
  portConfig?: {
    resource1: Resource; // First resource in AMM pair
    resource2: Resource; // Second resource in AMM pair
    // AMM pool state would go here
  };
}

// Hexagon face - regular resource tile
export interface HexagonFace extends Face {
  type: FaceType.Hexagon;
  vertexIds: string[]; // exactly 6
}

// Building on a vertex (same as before)
export enum BuildingType {
  Settlement = 'settlement',
  City = 'city'
}

export interface Building {
  type: BuildingType;
  player: number;
  vertexId: string;
}

// Complete Goldberg board state
export interface GoldbergBoard {
  vertices: Map<string, Vertex3D>;
  edges: Map<string, Edge3D>;
  faces: Face[]; // 12 pentagons + 180 hexagons = 192 total
  buildings: Map<string, Building>; // vertexId -> Building
  roads: Map<string, number>; // edgeId -> player number
  robberLocation: number; // face index where robber is located
}

// Constants for GP(1,4)
export const PENTAGON_COUNT = 12;
export const HEXAGON_COUNT = 180;
export const TOTAL_FACES = PENTAGON_COUNT + HEXAGON_COUNT;

// Helper to convert Cartesian to spherical coordinates
export function cartesianToSpherical(x: number, y: number, z: number): { theta: number; phi: number; r: number } {
  const r = Math.sqrt(x * x + y * y + z * z);
  const theta = Math.atan2(y, x);
  const phi = Math.acos(z / r);
  return { theta, phi, r };
}

// Helper to convert spherical to Cartesian coordinates (on unit sphere)
export function sphericalToCartesian(theta: number, phi: number): { x: number; y: number; z: number } {
  return {
    x: Math.sin(phi) * Math.cos(theta),
    y: Math.sin(phi) * Math.sin(theta),
    z: Math.cos(phi)
  };
}

// Calculate geodesic distance between two points on unit sphere
export function geodesicDistance(v1: Vertex3D, v2: Vertex3D): number {
  // Using dot product formula: cos(angle) = v1 · v2
  const dotProduct = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  // Clamp to avoid numerical errors
  const clampedDot = Math.max(-1, Math.min(1, dotProduct));
  return Math.acos(clampedDot);
}

// Project 3D point to 2D screen coordinates
export function project3DTo2D(
  vertex: Vertex3D,
  cameraRotation: { theta: number; phi: number },
  canvasWidth: number,
  canvasHeight: number,
  zoom: number = 1
): { x: number; y: number; visible: boolean } {
  // Rotate vertex based on camera rotation
  // First rotate around Z axis (theta)
  const cosTheta = Math.cos(-cameraRotation.theta);
  const sinTheta = Math.sin(-cameraRotation.theta);
  let x = vertex.x * cosTheta - vertex.y * sinTheta;
  let y = vertex.x * sinTheta + vertex.y * cosTheta;
  let z = vertex.z;
  
  // Then rotate around Y axis (phi)
  const cosPhi = Math.cos(-cameraRotation.phi);
  const sinPhi = Math.sin(-cameraRotation.phi);
  const newX = x * cosPhi + z * sinPhi;
  const newZ = -x * sinPhi + z * cosPhi;
  
  // Simple orthographic projection
  const scale = Math.min(canvasWidth, canvasHeight) * 0.4 * zoom;
  const screenX = canvasWidth / 2 + newX * scale;
  const screenY = canvasHeight / 2 - y * scale;
  
  // Check if face is visible (facing camera)
  const visible = newZ > -0.1; // Small threshold to show faces slightly past horizon
  
  return { x: screenX, y: screenY, visible };
}