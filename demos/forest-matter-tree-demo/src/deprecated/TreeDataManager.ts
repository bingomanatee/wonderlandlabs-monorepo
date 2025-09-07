// Serializable tree data structures and management
import type {
  SerializableConstraintData,
  SerializableNodeData,
  SerializableTreeState,
} from './types';

// Simple UUID generator
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Simple shuffle function
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Constants for tree generation - arrays of possible child counts for each depth
const BRANCH_CHILD_COUNTS = [
  [2, 3, 4], // Depth 0: Trunk top - 2-4 main branches
  [2, 3], // Depth 1: Primary branches - 2-3 children
  [2, 2, 3], // Depth 2: Secondary branches - mostly 2, some 3
  [2, 2, 2, 3], // Depth 3: Tertiary branches - mostly 2, few 3
  [1, 2], // Depth 4: Small branches - 1-2 children
  [1, 2], // Depth 5: Twigs - 1-2 children
  [0], // Depth 6+: No children (terminal)
];

// Manages serializable tree data and structure
export class TreeDataManager {
  private treeState: SerializableTreeState;

  constructor() {
    this.treeState = {
      nodes: {},
      constraints: {},
      rootId: '',
    };
  }

  // Get current serializable state
  getState(): SerializableTreeState {
    return JSON.parse(JSON.stringify(this.treeState)); // Deep copy
  }

  // Load state from serialized data
  loadState(state: SerializableTreeState): void {
    this.treeState = JSON.parse(JSON.stringify(state)); // Deep copy
  }

  // Node management
  getNode(id: string): SerializableNodeData | undefined {
    return this.treeState.nodes[id];
  }

  addNode(nodeData: SerializableNodeData): void {
    this.treeState.nodes[nodeData.id] = nodeData;
  }

  removeNode(nodeId: string): boolean {
    if (!this.treeState.nodes[nodeId]) return false;

    // Remove node
    delete this.treeState.nodes[nodeId];

    // Remove associated constraints
    const constraintsToRemove = Object.keys(this.treeState.constraints).filter(
      (id) =>
        this.treeState.constraints[id].parentId === nodeId ||
        this.treeState.constraints[id].childId === nodeId
    );

    constraintsToRemove.forEach((id) => delete this.treeState.constraints[id]);

    return true;
  }

  getAllNodes(): SerializableNodeData[] {
    return Object.values(this.treeState.nodes);
  }

  // Tree structure queries
  getChildren(nodeId: string): SerializableNodeData[] {
    return Object.values(this.treeState.nodes).filter((node) => node.parentId === nodeId);
  }

  getParent(nodeId: string): SerializableNodeData | undefined {
    const node = this.getNode(nodeId);
    if (!node?.parentId) return undefined;
    return this.getNode(node.parentId);
  }

  getRootNodes(): SerializableNodeData[] {
    return Object.values(this.treeState.nodes).filter((node) => !node.parentId);
  }

  // Tree traversal
  traverse(nodeId: string, fn: (node: SerializableNodeData) => void): void {
    const node = this.getNode(nodeId);
    if (!node) return;

    fn(node);
    const children = this.getChildren(nodeId);
    for (const child of children) {
      this.traverse(child.id, fn);
    }
  }

  // Constraint management
  addConstraint(constraintData: SerializableConstraintData): void {
    this.treeState.constraints[constraintData.id] = constraintData;

    // Add constraint ID to parent node
    const parent = this.getNode(constraintData.parentId);
    const child = this.getNode(constraintData.childId);

    if (parent && !parent.constraintIds.includes(constraintData.id)) {
      parent.constraintIds.push(constraintData.id);
    }
    if (child && !child.constraintIds.includes(constraintData.id)) {
      child.constraintIds.push(constraintData.id);
    }
  }

  getConstraint(id: string): SerializableConstraintData | undefined {
    return this.treeState.constraints[id];
  }

  getAllConstraints(): SerializableConstraintData[] {
    return Object.values(this.treeState.constraints);
  }

  // Connect two nodes with constraint metadata
  connectNodes(
    parentId: string,
    childId: string,
    length: number,
    stiffness: number,
    damping: number,
    isLeaf: boolean = false
  ): string {
    const parent = this.getNode(parentId);
    const child = this.getNode(childId);
    if (!parent || !child) throw new Error('Parent or child node not found');

    // Clean up any existing constraints to this child
    const childConstraintPattern = new RegExp(`_${childId}$`);
    const constraintsToRemove = Object.keys(this.treeState.constraints).filter((id) =>
      childConstraintPattern.test(id)
    );

    constraintsToRemove.forEach((id) => {
      delete this.treeState.constraints[id];
      // Remove from node constraint lists
      Object.values(this.treeState.nodes).forEach((node) => {
        const index = node.constraintIds.indexOf(id);
        if (index > -1) {
          node.constraintIds.splice(index, 1);
        }
      });
    });

    // Update parent-child relationship
    child.parentId = parentId;

    // Create constraint metadata
    const constraintId = `constraint_${parentId}_${childId}`;
    const constraintData: SerializableConstraintData = {
      id: constraintId,
      parentId,
      childId,
      length,
      stiffness,
      damping,
      isLeaf,
    };

    this.addConstraint(constraintData);
    return constraintId;
  }

  // Generate random tree structure
  generateRandomTree(): { adjacency: Map<string, string[]>; rootId: string } {
    // Clear existing state
    this.treeState = {
      nodes: {},
      constraints: {},
      rootId: '',
    };

    const adjacency = new Map<string, string[]>();
    const rootId = 'root';
    const nodeCounter = { value: 0 };

    // First, create the trunk (2-3 nodes in a straight line)
    const trunkHeight = 2 + Math.floor(Math.random() * 2); // 2-3 trunk nodes
    let currentTrunkNode = rootId;

    for (let i = 0; i < trunkHeight; i++) {
      const nextTrunkNode = `trunk_${i}`;
      adjacency.set(currentTrunkNode, [nextTrunkNode]);
      currentTrunkNode = nextTrunkNode;
      nodeCounter.value++;
    }

    // Start branching from the top of the trunk
    TreeDataManager.createBranches(adjacency, currentTrunkNode, 0, nodeCounter);

    this.treeState.rootId = rootId;
    return { adjacency, rootId };
  }

  // Static method for creating branches recursively
  static createBranches(
    adjacency: Map<string, string[]>,
    parentId: string,
    depth: number,
    nodeCounter: { value: number }
  ): void {
    // Get possible child counts for this depth
    const childCountOptions = BRANCH_CHILD_COUNTS[depth] ?? [0];

    // Randomly select number of children from the available options
    const shuffledOptions = shuffle([...childCountOptions]);
    const numChildren = shuffledOptions.pop() ?? 0;

    if (numChildren === 0) return; // No children for this node

    const children: string[] = [];
    for (let i = 0; i < numChildren; i++) {
      const childId = `branch_${nodeCounter.value++}`;
      children.push(childId);
      TreeDataManager.createBranches(adjacency, childId, depth + 1, nodeCounter);
    }

    if (children.length > 0) {
      adjacency.set(parentId, children);
    }
  }

  // Update physics state from external source
  updatePhysicsState(
    positions: Record<string, { x: number; y: number }>,
    velocities: Record<string, { x: number; y: number }>
  ): void {
    this.treeState.physicsState = { positions, velocities };
  }

  // Clear all data
  clear(): void {
    this.treeState = {
      nodes: {},
      constraints: {},
      rootId: '',
    };
  }

  // Get node count
  get nodeCount(): number {
    return Object.keys(this.treeState.nodes).length;
  }

  // Get root ID
  get rootId(): string {
    return this.treeState.rootId;
  }
}

// Global instance
export const TreeData = new TreeDataManager();
