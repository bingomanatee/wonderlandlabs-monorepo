import type { Body, Constraint, Engine, Render, World } from 'matter-js';

// Matter.js type aliases
export type MatterEngine = Engine;
export type MatterWorld = World;
export type MatterRender = Render;
export type MatterBody = Body;
export type MatterConstraint = Constraint;

// Serializable data types (for Forestry store)
export interface SerializableNodeData {
  id: string;
  parentId?: string;
  nodeType: '$branch' | 'leaf' | 'terminal_leaf';
  constraintIds: string[];
}

export interface SerializableConstraintData {
  id: string;
  parentId: string;
  childId: string;
  length: number;
  stiffness: number;
  damping: number;
  isLeaf: boolean;
}

// Spring configuration
export interface SpringSettings {
  length: number;
  stiffness: number;
  damping: number;
}

// Tree node data structure for Forestry state
export interface TreeNode {
  id: string;
  parentId?: string;
  nodeType: '$branch' | 'leaf' | 'terminal_leaf';
  constraintIds: string[];
  // Physics properties
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  // Visual properties
  radius: number;
  color: number;
}

// Constraint data structure for Forestry state
export interface TreeConstraint {
  id: string;
  parentId: string;
  childId: string;
  length: number;
  stiffness: number;
  damping: number;
  isLeaf: boolean;
}

// Main tree state for Forestry
export interface TreeState {
  nodes: Map<string, TreeNode>;
  constraints: Map<string, TreeConstraint>;
  rootId: string;
  // Physics settings
  gravity: { x: number; y: number };
  windForce: { x: number; y: number };
  // Canvas dimensions
  canvasWidth: number;
  canvasHeight: number;
}

// Tree actions for Forestry (these are the exposed signatures - Forestry automatically removes the value parameter)
export interface TreeActions {
  // Initialization
  initializePhysics: (container: HTMLDivElement) => void;
  initializeTree: () => void;

  // Tree generation
  generateTree: (rootX: number, rootY: number, depth: number) => void;
  generateChildrenForNode: (node: TreeNode, config: TreeConfig, depth: number) => void;
  addNode: (
    parentId: string,
    nodeType: TreeNode['nodeType'],
    position: { x: number; y: number }
  ) => string;
  addConstraint: (
    parentId: string,
    childId: string,
    settings: SpringSettings,
    isLeaf?: boolean
  ) => string;

  // Physics updates
  updatePhysics: () => void;
  applyWind: (force: { x: number; y: number }) => void;

  // Rendering
  render: () => void;

  // Cleanup
  cleanup: () => void;
}

// Configuration for tree generation
export interface TreeConfig {
  maxDepth: number;
  branchingFactor: number;
  branchLength: number;
  leafProbability: number;
  springStiffness: number;
  springDamping: number;
  nodeRadius: number;
  leafRadius: number;
}
