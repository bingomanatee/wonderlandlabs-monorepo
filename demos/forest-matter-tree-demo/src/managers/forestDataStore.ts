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
      // these methods are all "sugar" to access nodes and constraints from ref.
      getNodeRef(value: TreeStoreData, id: string): TreeNodeData | undefined {
        return this.res['nodes'].get(id);
      },
      removeNodeRef(_, nodeId: string) {
        this.res[RESOURCES.NODES].delete(nodeId);
      },
      addNodeRef(value: TreeStoreData, nodeData: TreeNodeData): void {
        this.res[RESOURCES.NODES].set(nodeData.id, nodeData);
      },
      addConstraintRef(value: TreeStoreData, id: string, constraint: MatterConstraint): void {
        this.res['constraints'].set(id, constraint);
      },
      getConstraintRef(value: TreeStoreData, id: string): MatterConstraint | undefined {
        return this.res['constraints'].get(id);
      },

      // Get all nodes
      getAllNodeRefs(value: TreeStoreData): TreeNodeData[] {
        return Array.from(this.res[RESOURCES.NODES].values());
      },

      // Get all constraints
      getAllConstraintRefs(): MatterConstraint[] {
        return Array.from(this.res['constraints'].values());
      },

      // Create connection between parent and child
      connectNodeRefs(
        value: TreeStoreData,
        parentId: string,
        childId: string,
        springSettings: SpringSettings,
        isLeaf: boolean = false
      ): string {
        const parent = this.acts.getNodeRef(parentId);
        const child = this.acts.getNodeRef(childId);
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
          this.res[RESOURCES.NODES].forEach((node) => {
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

        this.acts.addConstraintRef(constraintId, constraint);
        parent.constraintIds.push(constraintId);
        child.constraintIds.push(constraintId); // IMPORTANT: Child also needs to know about this constraint!
        return constraintId;
      },

      // Clear all data (useful for cleanup)
      clearRefs(): void {
        this.res[RESOURCES.NODES].clear();
        this.res['constraints'].clear();
      },
    },
  });
}
