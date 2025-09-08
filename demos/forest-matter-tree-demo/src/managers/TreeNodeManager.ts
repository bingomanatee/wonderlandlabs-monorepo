import { Constraint, World } from 'matter-js';
import { BRANCH_CHILD_COUNTS, globalResources, RESOURCES } from './constants';
import type { MatterConstraint, MatterWorld, SpringSettings, TreeNodeData } from './types.ts';
import { shuffle } from 'lodash-es';

// Global tree node manager class
export class TreeNodeManager {
  private nodes = new Map<string, TreeNodeData>();
  private constraints = new Map<string, MatterConstraint>();

  // Helper methods
  getNode(id: string): TreeNodeData | undefined {
    return this.nodes.get(id);
  }

  addNode(nodeData: TreeNodeData): void {
    this.nodes.set(nodeData.id, nodeData);
  }

  addConstraint(id: string, constraint: MatterConstraint): void {
    this.constraints.set(id, constraint);
  }

  getConstraint(id: string): MatterConstraint | undefined {
    return this.constraints.get(id);
  }

  getChildren(nodeId: string): TreeNodeData[] {
    const children: TreeNodeData[] = [];
    this.nodes.forEach((node, id) => {
      if (node.parentId === nodeId) {
        children.push(node);
      }
    });
    return children;
  }

  getParent(nodeId: string): TreeNodeData | undefined {
    const node = this.getNode(nodeId);
    if (!node?.parentId) {
      return undefined;
    }
    return this.getNode(node.parentId);
  }

  // Get all nodes
  getAllNodes(): TreeNodeData[] {
    return Array.from(this.nodes.values());
  }

  // Get all constraints
  getAllConstraints(): MatterConstraint[] {
    return Array.from(this.constraints.values());
  }

  // DFS traversal
  traverse(nodeId: string, fn: (node: TreeNodeData) => void): void {
    const node = this.getNode(nodeId);
    if (!node) {
      return;
    }

    fn(node);
    const children = this.getChildren(nodeId);
    for (const child of children) {
      this.traverse(child.id, fn);
    }
  }

  // Create connection between parent and child
  connectNodes(
    parentId: string,
    childId: string,
    springSettings: SpringSettings,
    isLeaf: boolean = false
  ): string {
    const parent = this.getNode(parentId);
    const child = this.getNode(childId);
    if (!parent || !child) {
      throw new Error('Parent or child node not found');
    }

    // Clean up any existing constraints to this child node
    const childConstraintPattern = new RegExp(`_${childId}$`);
    const constraintsToRemove: string[] = [];

    this.constraints.forEach((constraint, constraintId) => {
      if (childConstraintPattern.test(constraintId)) {
        constraintsToRemove.push(constraintId);
      }
    });

    // Remove old constraints from Matter.js world and clean up data structures
    const world = globalResources.get(RESOURCES.WORLD) as MatterWorld;
    constraintsToRemove.forEach((oldConstraintId) => {
      const oldConstraint = this.constraints.get(oldConstraintId);
      if (oldConstraint && world) {
        // Remove from Matter.js physics world
        World.remove(world, oldConstraint);
      }

      // Remove from our data structures
      this.constraints.delete(oldConstraintId);

      // Remove from all nodes' constraint lists
      this.nodes.forEach((node) => {
        const index = node.constraintIds.indexOf(oldConstraintId);
        if (index > -1) {
          node.constraintIds.splice(index, 1);
        }
      });
    });

    // Update parent-child relationship (single source of truth)
    child.parentId = parentId;

    // Create new constraint
    const constraintId = `constraint_${parentId}_${childId}`;

    const constraint = Constraint.create({
      bodyA: parent.body,
      bodyB: child.body,
      length: springSettings.length,
      stiffness: springSettings.stiffness,
      damping: springSettings.damping,
      render: {
        strokeStyle: isLeaf ? '#4a9d4a' : '#6af08e',
        lineWidth: isLeaf ? 1 : 2,
      },
    });

    if (!constraint) {
      console.error(`❌ Failed to create constraint ${constraintId}`);
      return constraintId;
    }

    this.addConstraint(constraintId, constraint);
    parent.constraintIds.push(constraintId);
    child.constraintIds.push(constraintId); // IMPORTANT: Child also needs to know about this constraint!
    return constraintId;
  }

  // Remove a specific node and its constraints
  removeNode(nodeId: string): boolean {
    const node = this.getNode(nodeId);
    if (!node) return false;

    // Remove all constraints owned by this node
    node.constraintIds.forEach((constraintId) => {
      this.constraints.delete(constraintId);
    });

    // Remove the node itself
    this.nodes.delete(nodeId);

    return true;
  }

  // Clear all data (useful for cleanup)
  clear(): void {
    this.nodes.clear();
    this.constraints.clear();
  }
}

// Global instance
export const TreeNodes = new TreeNodeManager();
