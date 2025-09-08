import { Forest, type StoreIF } from '@wonderlandlabs/forestry4';
import type { MatterConstraint, MatterWorld, SpringSettings, TreeNodeData } from './types.ts';
import { globalResources, RESOURCES } from './constants.ts';
import { Constraint, World } from 'matter-js';

export type TreeStoreData = {};

export default function forestDataStore(canvas: HTMLCanvasElement): StoreIF<TreeStoreData> {
  return new Forest({
    value: {},
    res: new Map<string, any>([
      ['canvas', canvas],
      ['nodes', new Map()],
      ['constraints', new Map()],
    ]),
    actions: {
      // Helper methods
      getNode(value: TreeStoreData, id: string): TreeNodeData | undefined {
        return this.res['nodes'].get(id);
      },
      addNode(value: TreeStoreData, nodeData: TreeNodeData): void {
        this.res['nodes'].set(nodeData.id, nodeData);
      },
      addConstraint(value: TreeStoreData, id: string, constraint: MatterConstraint): void {
        this.res['constraints'].set(id, constraint);
      },
      getConstraint(value: TreeStoreData, id: string): MatterConstraint | undefined {
        return this.res['constraints'].get(id);
      },
      getChildren(value: TreeStoreData, nodeId: string): TreeNodeData[] {
        const children: TreeNodeData[] = [];
        this.res['nodes'].forEach((node, id) => {
          if (node.parentId === nodeId) {
            children.push(node);
          }
        });
        return children;
      },
      getParent(value: TreeStoreData, nodeId: string): TreeNodeData | undefined {
        const node = this.getNode(nodeId);
        if (!node?.parentId) {
          return undefined;
        }
        return this.getNode(node.parentId);
      },

      // Get all nodes
      getAllNodes(value: TreeStoreData): TreeNodeData[] {
        return Array.from(this.res['nodes'].values());
      },

      // Get all constraints
      getAllConstraints(): MatterConstraint[] {
        return Array.from(this.res['constraints'].values());
      },

      // DFS traversal
      traverse(value: TreeStoreData, nodeId: string, fn: (node: TreeNodeData) => void): void {
        const node = this.getNode(nodeId);
        if (!node) {
          return;
        }

        fn(node);
        const children = this.getChildren(nodeId);
        for (const child of children) {
          this.traverse(child.id, fn);
        }
      },

      // Create connection between parent and child
      connectNodes(
        value: TreeStoreData,
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

        this.res['constraints'].forEach((constraint, constraintId) => {
          if (childConstraintPattern.test(constraintId)) {
            constraintsToRemove.push(constraintId);
          }
        });

        // Remove old constraints from Matter.js world and clean up data structures
        const world = globalResources.get(RESOURCES.WORLD) as MatterWorld;
        constraintsToRemove.forEach((oldConstraintId) => {
          const oldConstraint = this.res['constraints'].get(oldConstraintId);
          if (oldConstraint && world) {
            // Remove from Matter.js physics world
            World.remove(world, oldConstraint);
          }

          // Remove from our data structures
          this.res['constraints'].delete(oldConstraintId);

          // Remove from all nodes' constraint lists
          this.res['nodes'].forEach((node) => {
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
          return constraintId;
        }

        this.addConstraint(constraintId, constraint);
        parent.constraintIds.push(constraintId);
        child.constraintIds.push(constraintId); // IMPORTANT: Child also needs to know about this constraint!
        return constraintId;
      },

      // Remove a specific node and its constraints
      removeNode(value: TreeStoreData, nodeId: string): boolean {
        const node = this.getNode(nodeId);
        if (!node) {
          return false;
        }

        // Remove all constraints owned by this node
        node.constraintIds.forEach((constraintId) => {
          this.res['constraints'].delete(constraintId);
        });

        // Remove the node itself
        this.res['nodes'].delete(nodeId);

        return true;
      },

      // Clear all data (useful for cleanup)
      clear(): void {
        this.res['nodes'].clear();
        this.res['constraints'].clear();
      },
    },
  });
}
