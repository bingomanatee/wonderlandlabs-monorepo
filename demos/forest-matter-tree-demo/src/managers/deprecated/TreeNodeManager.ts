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
// export const TreeNodes = new TreeNodeManager();
