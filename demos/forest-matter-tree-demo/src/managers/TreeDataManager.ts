// Serializable tree data structures and management
import type {
  SerializableNodeData,
  SerializableConstraintData,
  SerializableTreeState,
} from './types';
import { BRANCH_CHILD_COUNTS } from './constants';

// Simple shuffle function
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Manages serializable tree data and structure
export class TreeDataManager {
  public treeState: SerializableTreeState;

  constructor() {
    this.treeState = {
      nodes: {},
      constraints: {},
      rootId: '',
    };
  }

  // Node management
  getNode(id: string): SerializableNodeData | undefined {
    return this.treeState.nodes[id];
  }

  addNode(nodeData: SerializableNodeData): void {
    this.treeState.nodes[nodeData.id] = nodeData;
  }
  // Tree structure queries
  getChildren(nodeId: string): SerializableNodeData[] {
    return Object.values(this.treeState.nodes).filter((node) => node.parentId === nodeId);
  }

  // Tree traversal
  traverseNodes(nodeId: string, fn: (node: SerializableNodeData) => void): void {
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
