// Serializable tree data structures and management
import type {
  SerializableNodeData,
  SerializableConstraintData,
  SerializableTreeState,
} from '../types';
import createBranches from '../createBranches';

// Manages serializable tree data and structure
export class TreeDataManager {
  private treeState: SerializableTreeState;

  constructor() {
    this.treeState = {
      nodes: new Map(),
      constraints: new Map(),
      rootId: '',
    };
  }

  // Node management
  getNode(id: string): SerializableNodeData | undefined {
    return this.treeState.nodes.get(id);
  }

  addNode(nodeData: SerializableNodeData): void {
    this.treeState.nodes.set(nodeData.id, nodeData);
  }
  // Tree structure queries
  getChildren(nodeId: string): SerializableNodeData[] {
    return Array.from(this.treeState.nodes.values()).filter((node) => node.parentId === nodeId);
  }

  // Tree traversal
  traverseNodes(nodeId: string, fn: (node: SerializableNodeData) => void): void {
    const node = this.getNode(nodeId);
    if (!node) return;

    fn(node);
    const children = this.getChildren(nodeId);
    for (const child of children) {
      this.traverseNodes(child.id, fn);
    }
  }

  // Constraint management
  addConstraint(constraintData: SerializableConstraintData): void {
    this.treeState.constraints.set(constraintData.id, constraintData);

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
    return this.treeState.constraints.get(id);
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
    const constraintsToRemove = Array.from(this.treeState.constraints.keys()).filter((id) =>
      childConstraintPattern.test(id)
    );

    constraintsToRemove.forEach((id) => {
      this.treeState.constraints.delete(id);
      // Remove from node constraint lists
      Array.from(this.treeState.nodes.values()).forEach((node) => {
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
      nodes: new Map(),
      constraints: new Map(),
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
    createBranches(adjacency, currentTrunkNode, 0, nodeCounter);

    this.treeState.rootId = rootId;
    return { adjacency, rootId };
  }

  // Get root ID
  get rootId(): string {
    return this.treeState.rootId;
  }
}
