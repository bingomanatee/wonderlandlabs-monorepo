import { Forest, type StoreIF } from '@wonderlandlabs/forestry4';
import type {
  MatterConstraint,
  MatterWorld,
  SerializableConstraintData,
  SerializableNodeData,
  SpringSettings,
  TreeNodeData,
} from './types';
import { globalResources, RESOURCES } from './constants';
import { Constraint, World } from 'matter-js';
import createBranches from './createBranches';

export type TreeStoreData = {
  nodes: Map<string, SerializableNodeData>;
  constraints: Map<string, SerializableConstraintData>;
  rootId: string;
};

export default function forestDataStore(canvas: HTMLCanvasElement): StoreIF<TreeStoreData> {
  return new Forest({
    value: {
      nodes: new Map(),
      constraints: new Map(),
      rootId: '',
    },
    res: new Map<string, any>([
      ['canvas', canvas],
      [RESOURCES.NODES, new Map()],
      [RESOURCES.CONSTRAINTS, new Map()],
    ]),
    actions: {
      // Node management
      getNode(value: TreeStoreData, id: string): SerializableNodeData | undefined {
        return value.nodes.get(id);
      },

      addNode(value: TreeStoreData, nodeData: SerializableNodeData): void {
        this.set([RESOURCES.NODES, nodeData.id], nodeData);
      },
      // Tree structure queries
      getChildren(value: TreeStoreData, nodeId: string): SerializableNodeData[] {
        return Array.from(value.nodes.values()).filter((node) => node.parentId === nodeId);
      },

      // Tree traversal
      traverseNodes(
        value: TreeStoreData,
        nodeId: string,
        fn: (node: SerializableNodeData) => void
      ): void {
        const node = this.acts.getNode(nodeId);
        if (!node) {
          return;
        }

        fn(node);
        const children = this.acts.getChildren(nodeId);
        for (const child of children) {
          this.acts.traverseNodes(child.id, fn);
        }
      },

      // Constraint management
      addConstraint(value: TreeStoreData, constraintData: SerializableConstraintData): void {
        this.set(['constraints', constraintData.id], constraintData);

        // Add constraint ID to parent node
        const parent = this.acts.getNode(constraintData.parentId);
        const child = this.acts.getNode(constraintData.childId);

        if (parent && !parent.constraintIds.includes(constraintData.id)) {
          this.acts.addConstraintId(constraintData.parentId, constraintData.id);
        }
        if (child && !child.constraintIds.includes(constraintData.id)) {
          this.acts.addConstraintId(constraintData.childId, constraintData.id);
        }
      },

      setConstraintLength(_, constraintId, length) {
        this.mutate((draft) => {
          const constraint = draft.constraints.get(constraintId);
          if (constraint) {
            constraint.length = length;
          }
        });
      },
      addConstraintId(_, nodeId, constraintId) {
        this.mutate((draft) => {
          draft.nodes.get(nodeId)?.constraintIds.push(constraintId);
          return draft;
        });
      },

      getConstraint(value: TreeStoreData, id: string): SerializableConstraintData | undefined {
        return value.constraints.get(id);
      },
      // Connect two nodes with constraint metadata
      connectNodes(
        value: TreeStoreData,
        parentId: string,
        childId: string,
        length: number,
        stiffness: number,
        damping: number,
        isLeaf: boolean = false
      ): string {
        const parent = this.acts.getNode(parentId);
        const child = this.acts.getNode(childId);
        if (!parent || !child) {
          throw new Error('Parent or child node not found');
        }

        // Clean up any existing constraints to this child
        const childConstraintPattern = new RegExp(`_${childId}$`);
        const constraintsToRemove = Array.from(value.constraints.keys()).filter((id) =>
          childConstraintPattern.test(id)
        );

        constraintsToRemove.forEach((id) => {
          value.constraints.delete(id);
          // Remove from node constraint lists
          Array.from(value.nodes.values()).forEach((node) => {
            const index = node.constraintIds.indexOf(id);
            if (index > -1) {
              node.constraintIds.splice(index, 1);
            }
          });
        });

        // Update parent-child relationship
        this.set([RESOURCES.NODES, childId, 'parentId'], parentId);

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

        this.acts.addConstraint(constraintData);
        return constraintId;
      },

      // Generate random tree structure
      generateRandomTree(): { adjacency: Map<string, string[]>; rootId: string } {
        // Clear existing state
        this.mutate(() => ({
          nodes: new Map(),
          constraints: new Map(),
          roodId: '',
        }));

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

        this.set('rootId', rootId);
        return { adjacency, rootId };
      },

      // these methods are all "sugar" to access nodes and constraints from ref.
      getNodeRef(value: TreeStoreData, id: string): TreeNodeData | undefined {
        return this.res.get(RESOURCES.NODES).get(id);
      },
      removeNodeRef(_, nodeId: string) {
        this.res.get(RESOURCES.NODES).delete(nodeId);
      },
      addNodeRef(value: TreeStoreData, nodeData: TreeNodeData): void {
        this.res.get(RESOURCES.NODES).set(nodeData.id, nodeData);
      },
      addConstraintRef(value: TreeStoreData, id: string, constraint: MatterConstraint): void {
        this.res['constraints'].set(id, constraint);
      },
      getConstraintRef(value: TreeStoreData, id: string): MatterConstraint | undefined {
        return this.res['constraints'].get(id);
      },

      // Get all nodes
      getAllNodeRefs(value: TreeStoreData): TreeNodeData[] {
        return Array.from(this.res.get(RESOURCES.NODES).values());
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
          this.res.get(RESOURCES.NODES).forEach((node) => {
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
        this.res.get(RESOURCES.NODES).clear();
        this.res['constraints'].clear();
      },
    },
  });
}
