import { Forest, type StoreIF } from '@wonderlandlabs/forestry4';
import type {
  MatterConstraint,
  MatterWorld,
  NabParams,
  SerializableConstraintData,
  SerializableNodeData,
  SpringSettings,
  TreeNodeData,
} from '../types';
import { RESOURCES } from './constants';
import { Constraint, World } from 'matter-js';
import { PhysicsUtils } from './PhysicsUtils';

export type SeasonalColors = {
  skyTop: number;
  skyBottom: number;
  groundTop: number;
  groundBottom: number;
  branchColor: number;
  leafColor: number;
  stemColor: number;
};

export type TreeStoreData = {
  nodes: Map<string, SerializableNodeData>;
  constraints: Map<string, SerializableConstraintData>;
  rootId: string;
  scaleBasis: number;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  colors: SeasonalColors;
};

// Get seasonal colors
function getSeasonalColors(season: 'spring' | 'summer' | 'autumn' | 'winter'): SeasonalColors {
  switch (season) {
    case 'spring':
      return {
        skyTop: 0x87ceeb, // Sky blue
        skyBottom: 0xb0e0e6, // Powder blue (lighter at horizon)
        groundTop: 0x90ee90, // Light green
        groundBottom: 0x228b22, // Forest green
        branchColor: 0x8b4513, // Saddle brown
        leafColor: 0x90ee90, // Light green
        stemColor: 0x32cd32, // Lime green
      };
    case 'summer':
      return {
        skyTop: 0x4169e1, // Royal blue
        skyBottom: 0x87ceeb, // Sky blue (lighter at horizon)
        groundTop: 0x32cd32, // Lime green
        groundBottom: 0x006400, // Dark green
        branchColor: 0x654321, // Dark brown
        leafColor: 0x228b22, // Forest green
        stemColor: 0x32cd32, // Lime green
      };
    case 'autumn':
      return {
        skyTop: 0xff8c00, // Dark orange
        skyBottom: 0xffd700, // Gold (lighter at horizon)
        groundTop: 0xd2691e, // Chocolate
        groundBottom: 0x8b4513, // Saddle brown
        branchColor: 0x8b4513, // Saddle brown
        leafColor: 0xff8c00, // Dark orange
        stemColor: 0xd2691e, // Chocolate
      };
    case 'winter':
      return {
        skyTop: 0xffffff, // Slate gray
        skyBottom: 0xc0c0c0, // Silver (lighter at horizon)
        groundTop: 0xf0f8ff, // Alice blue (snow)
        groundBottom: 0x333339, // Dim gray
        branchColor: 0x2f4f4f, // Dark slate gray
        leafColor: 0x8fbc8f, // Dark sea green (evergreen)
        stemColor: 0x556b2f, // Dark olive green
      };
    default:
      return getSeasonalColors('summer');
  }
}

export default function forestDataStore(canvas: HTMLCanvasElement): StoreIF<TreeStoreData> {
  // Calculate scale basis from canvas dimensions
  const scaleBasis = (canvas.width + canvas.height) / 2;

  const initialValue: TreeStoreData = {
    nodes: new Map(),
    constraints: new Map(),
    rootId: '',
    scaleBasis: scaleBasis,
    season: 'summer' as const,
    colors: getSeasonalColors('summer'),
  };

  console.log('---- initial value:', initialValue);
  const forest = new Forest({
    value: initialValue,
    res: new Map<string, any>([
      ['canvas', canvas],
      [RESOURCES.NODES, new Map()],
      [RESOURCES.CONSTRAINTS, new Map()],
      [RESOURCES.BODIES, new Map()],
    ]),
    tests: (value) => {
      if (!value.scaleBasis) {
        console.log('bad value:', value);
        throw new Error('no scaleBasis');
      }
    },
    actions: {
      // Controller methods

      generateTree(_, canvasWidth: number, canvasHeight: number): string {
        console.log('generateTree called with canvas:', canvasWidth, 'x', canvasHeight);
        const { adjacency, rootId } = this.acts.generateRandomTree();
        console.log('Generated tree structure - rootId:', rootId, 'adjacency size:', adjacency.size);
        this.acts.buildPhysicsTree(adjacency, rootId, canvasWidth, canvasHeight);
        console.log('Built physics tree - nodes:', this.value.nodes.size, 'constraints:', this.value.constraints.size);
        return rootId;
      },

      setSeason(_, season: 'spring' | 'summer' | 'autumn' | 'winter'): void {
        this.set('season', season);
        this.set('colors', getSeasonalColors(season));
      },

      updateSpringLengths(_, canvasHeight: number): void {
        const utils = this.res.get(RESOURCES.UTILS);
        const springs = utils.getSpringSettings(canvasHeight);

        this.acts.traverseNodes(this.value.rootId, (node) => {
          node.constraintIds.forEach((constraintId) => {
            const constraintData = this.acts.getConstraint(constraintId);
            if (constraintData) {
              const newLength = constraintData.isLeaf
                ? springs.leafSpring.length
                : springs.spring.length;

              this.acts.setConstraintLength(constraintId, newLength);
              utils.updateConstraint(constraintId, { length: newLength });
            }
          });
        });
      },

      buildPhysicsTree(
        _,
        adjacency: Map<string, string[]>,
        rootId: string,
        canvasWidth: number,
        canvasHeight: number
      ): void {
        const utils = this.res.get(RESOURCES.UTILS);
        utils.clear();

        const springs = utils.getSpringSettings(canvasHeight);

        const depth = utils.makeDepth(rootId, adjacency);
        const maxDepth = Math.max(...depth.values());
        const counts = new Map();
        for (const [id, d] of depth) {
          counts.set(d, (counts.get(d) || 0) + 1);
        }
        const idxByDepth = new Map();

        const bodyIds: string[] = [];

        const allNodeIds = new Set([rootId]);
        adjacency.forEach((children, parent) => {
          allNodeIds.add(parent);
          children.forEach((child) => allNodeIds.add(child));
        });

        const nabProps: NabParams = {
          bodyIds,
          canvasWidth,
          canvasHeight,
          counts,
          idxByDepth,
          depth,
        };

        allNodeIds.forEach((id) => utils.createNodeAndBody(id, nabProps));

        utils.addBodiesToWorld(bodyIds);

        const constraintIds: string[] = [];

        adjacency.forEach((children, parentId) => {
          const parentDepth = depth.get(parentId) ?? 0;

          children.forEach((childId) => {
            const childDepth = depth.get(childId) ?? 0;

            const depthFactor = childDepth / maxDepth;
            const length = springs.spring.length * (1 - depthFactor * 0.4);
            const stiffness = springs.spring.stiffness * (1 + depthFactor * 2);
            const damping = springs.spring.damping * (1 + depthFactor * 0.5);

            const constraintId = this.acts.connectNodes(
              parentId,
              childId,
              { length, stiffness, damping },
              false
            );

            const constraintData = this.acts.getConstraint(constraintId);
            if (constraintData) {
              const physicsConstraint = utils.createConstraint(
                constraintData,
                childDepth,
                maxDepth
              );
              if (physicsConstraint) {
                constraintIds.push(constraintId);
              }
            }

            if (parentDepth > 0) {
              utils.addLeafNodes(parentId, childId, canvasHeight);
            }
          });
        });

        allNodeIds.forEach((nodeId) => {
          const children = adjacency.get(nodeId) || [];
          const nodeDepth = depth.get(nodeId) ?? 0;

          if (children.length === 0 && nodeDepth > 0) {
            utils.addTerminalLeaves(nodeId, canvasHeight);
          }
        });

        utils.addConstraintsToWorld(constraintIds);
      },

      scaleTree(_, oldWidth: number, oldHeight: number, newWidth: number, newHeight: number): void {
        const scaleX = newWidth / oldWidth;
        const scaleY = newHeight / oldHeight;
        const oldCenterX = oldWidth * 0.5;
        const oldCenterY = oldHeight * 0.5;
        const newCenterX = newWidth * 0.5;
        const newCenterY = newHeight * 0.5;
        const utils = this.res.get(RESOURCES.UTILS);

        utils.scaleAllPositions(scaleX, scaleY, oldCenterX, oldCenterY, newCenterX, newCenterY);

        this.acts.updateSpringLengths(newHeight);
      },
      // Node management
      getNode(value: TreeStoreData, id: string): SerializableNodeData | undefined {
        return value.nodes.get(id);
      },

      addNode(_, nodeData: SerializableNodeData): void {
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
        this.set([RESOURCES.CONSTRAINTS, constraintData.id], constraintData);

        // Add constraint ID to parent node
        const parent = this.acts.getNode(constraintData.parentId);
        const child = this.acts.getNode(constraintData.childId);

        if (parent && !parent.constraintIds.includes(constraintData.id)) {
          this.acts.addConstraintIdToNode(constraintData.parentId, constraintData.id);
        }
        if (child && !child.constraintIds.includes(constraintData.id)) {
          this.acts.addConstraintIdToNode(constraintData.childId, constraintData.id);
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

      addConstraintIdToNode(_, nodeId, constraintId) {
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
        spring: SpringSettings,
        isLeaf: boolean = false
      ): string {
        const parent = this.acts.getNode(parentId);
        const child = this.acts.getNode(childId);
        const { length, stiffness, damping } = spring;
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
        const utils = this.res.get(RESOURCES.UTILS);
        // Clear existing state
        this.mutate((value) => ({
          ...value,
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
        utils.createBranches(adjacency, currentTrunkNode, 0, nodeCounter);

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
      addNodeRef(value: TreeStoreData, id: string, nodeData: TreeNodeData): void {
        if (id && nodeData && typeof id === 'string' && typeof nodeData == 'object') {
          this.res.get(RESOURCES.NODES).set(id, nodeData);
        } else {
          throw new Error('cannot add bad leaf: invalid id or nodeData');
        }
      },
      addConstraintRef(value: TreeStoreData, id: string, constraint: MatterConstraint): void {
        this.res.get(RESOURCES.CONSTRAINTS).set(id, constraint);
      },
      getConstraintRef(value: TreeStoreData, id: string): MatterConstraint | undefined {
        return this.res.get(RESOURCES.CONSTRAINTS).get(id);
      },

      // Get all nodes
      getAllNodeRefs(value: TreeStoreData): TreeNodeData[] {
        return Array.from(this.res.get(RESOURCES.NODES).values());
      },

      // Get all constraints
      getAllConstraintRefs(): MatterConstraint[] {
        return Array.from(this.res.get(RESOURCES.CONSTRAINTS).values());
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

        this.res.get(RESOURCES.CONSTRAINTS).forEach((constraint, constraintId) => {
          if (childConstraintPattern.test(constraintId)) {
            constraintsToRemove.push(constraintId);
          }
        });

        // Remove old constraints from Matter.js world and clean up data structures
        const world = this.res.get(RESOURCES.WORLD) as MatterWorld;
        constraintsToRemove.forEach((oldConstraintId) => {
          const oldConstraint = this.res.get(RESOURCES.CONSTRAINTS).get(oldConstraintId);
          if (oldConstraint && world) {
            // Remove from Matter.js physics world
            World.remove(world, oldConstraint);
          }

          // Remove from our data structures
          this.res.get(RESOURCES.CONSTRAINTS).delete(oldConstraintId);

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
        this.res.get(RESOURCES.CONSTRAINTS).clear();
      },
    },
  });

  const utils = new PhysicsUtils(forest);
  forest.res.set(RESOURCES.UTILS, utils);

  return forest;
}
