import { Forest } from '@wonderlandlabs/forestry4';
import { Bodies, Constraint, Engine, World } from 'matter-js';
import { PhysicsManager } from './PhysicsManager';
import { TreePhysics } from './TreePhysics';
import { CFG, RESOURCES } from './constants';
import { generateUUID } from './GenerateUUID.ts';

// Define types inline to avoid import issues
interface SerializableNodeData {
  id: string;
  parentId?: string;
  nodeType: 'branch' | 'leaf' | 'terminal_leaf';
  constraintIds: string[];
}

interface SerializableConstraintData {
  id: string;
  parentId: string;
  childId: string;
  length: number;
  stiffness: number;
  damping: number;
  isLeaf: boolean;
}

interface SerializableTreeState {
  nodes: Record<string, SerializableNodeData>;
  constraints: Record<string, SerializableConstraintData>;
  rootId: string;
}

// Define the actions interface
interface TreeDataActions {
  getState: () => SerializableTreeState;
  loadState: (state: SerializableTreeState) => void;
  getNode: (id: string) => SerializableNodeData | undefined;
  addNode: (nodeData: SerializableNodeData) => void;
  removeNode: (nodeId: string) => boolean;
  getAllNodes: () => SerializableNodeData[];
  addConstraint: (constraintData: SerializableConstraintData) => void;
  getConstraint: (id: string) => SerializableConstraintData | undefined;
  getAllConstraints: () => SerializableConstraintData[];
  connectNodes: (
    parentId: string,
    childId: string,
    length: number,
    stiffness: number,
    damping: number,
    isLeaf?: boolean
  ) => string;
  generateRandomTree: () => { adjacency: Map<string, string[]>; rootId: string };
  createBranches: (
    adjacency: Map<string, string[]>,
    parentId: string,
    depth: number,
    nodeCounter: { value: number }
  ) => void;
  getChildren: (nodeId: string) => SerializableNodeData[];
  getParent: (nodeId: string) => SerializableNodeData | undefined;
  getRootNodes: () => SerializableNodeData[];
  traverse: (nodeId: string, fn: (node: SerializableNodeData) => void) => void;
  clear: () => void;
  getNodeCount: () => number;
  getRootId: () => string;
}

// Helper functions and constants from TreeDataManager
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const BRANCH_CHILD_COUNTS = [
  [2, 3, 4], // Depth 0: Trunk top - 2-4 main branches
  [2, 3], // Depth 1: Primary branches - 2-3 children
  [2, 2, 3], // Depth 2: Secondary branches - mostly 2, some 3
  [2, 2, 2, 3], // Depth 3: Tertiary branches - mostly 2, few 3
  [1, 2], // Depth 4: Small branches - 1-2 children
  [1, 2], // Depth 5: Twigs - 1-2 children
];

export type ProcessChildParams = {
  childId: string;
  depth: Map<string, any>;
  maxDepth: number;
  constraintIds: string[];
  canvasHeight: number;
  parentDepth: number;
  parentId: string;
};

export type CreateTerminalLeafBodyParams = {
  i: number;
  numLeaves: number;
  terminalNodeId: string;
  terminalBody: any;
  canvasHeight: number;
};

// Forestry store factory that creates tree data with embedded physics
export function createForestryTreeData(canvasWidth: number, canvasHeight: number) {
  const engine = Engine.create();
  const world = engine.world;

  const forest = new Forest<SerializableTreeState, TreeDataActions>({
    value: {
      nodes: {},
      constraints: {},
      rootId: '',
    },
    res: new Map([
      ['matterBodies', new Map()],
      ['matterConstraints', new Map()],
      ['matterEngine', null],
      ['matterRender', null],
      ['matterWorld', null],
      ['matterRunner', null],
      [RESOURCES.ENGINE, engine],
      [RESOURCES.WORLD, world],
    ]),
    actions: {
      // === RESOURCE CREATION ===
      createResources(value: SerializableTreeState, canvas: HTMLCanvasElement): void {
        const forest = this as unknown as Forest<SerializableTreeState, any>;

        // Only create if not already created
        if (!forest.res.get('physicsManager')) {
          console.log(
            '🔧 Creating physics resources with canvas:',
            canvas.width,
            'x',
            canvas.height
          );

          // Create PhysicsManager
          const physicsManager = new PhysicsManager(forest);
          forest.res.set('physicsManager', physicsManager);

          // Create TreePhysics with actual canvas
          const treePhysics = new TreePhysics(canvas, forest);
          forest.res.set('treePhysics', treePhysics);

          // Initialize physics with the tree data
          forest.acts.initializePhysics();

          console.log('✅ Physics resources created and initialized');
        }
      },

      // Initialize physics with existing tree data
      initializePhysics(value: SerializableTreeState): void {
        const forest = this as unknown as Forest<SerializableTreeState, any>;
        const physicsManager = forest.res.get('physicsManager') as PhysicsManager;
        const treePhysics = forest.res.get('treePhysics');

        if (!physicsManager || !treePhysics) {
          console.error('Physics resources not available for initialization');
          return;
        }

        console.log('🚀 Initializing physics with existing tree data');

        // Create physics bodies for all existing nodes
        const allNodes = forest.acts.getAllNodes();
        allNodes.forEach((node) => {
          // Create physics body for each node (simplified positioning for now)
          const x = 400 + (Math.random() - 0.5) * 200;
          const y = 400 - Math.random() * 300;

          forest.acts.createBody(node, x, y, 8, {
            frictionAir: 0.01,
            render: { fillStyle: '#228B22' },
          });
        });

        // Create physics constraints for all existing constraints
        const allConstraints = forest.acts.getAllConstraints();
        allConstraints.forEach((constraint) => {
          const physicsConstraint = physicsManager.createConstraint(constraint);
          if (physicsConstraint) {
            physicsManager.addConstraintsToWorld([constraint.id]);
          }
        });

        console.log(
          '✅ Physics initialized with',
          allNodes.length,
          'nodes and',
          allConstraints.length,
          'constraints'
        );
      },

      // === PHYSICS BODY ACCESS (from PhysicsManager) ===
      getPhysicsBody(value: SerializableTreeState, nodeId: string): any {
        const forest = this as unknown as Forest<SerializableTreeState, any>;
        const bodies = forest.res.get('matterBodies') as Map<string, any>;
        return bodies?.get(nodeId);
      },

      getAllPhysicsBodies(value: SerializableTreeState): any[] {
        const forest = this as unknown as Forest<SerializableTreeState, any>;
        const bodies = forest.res.get('matterBodies') as Map<string, any>;
        return bodies ? Array.from(bodies.values()) : [];
      },

      // === PHYSICS MANAGER ACCESS (deprecated - will be removed) ===
      getPhysicsManager(value: SerializableTreeState): PhysicsManager {
        const forest = this as unknown as Forest<SerializableTreeState, any>;
        return forest.res.get('physicsManager') as PhysicsManager;
      },

      makeDepth(value: SerializableTreeState, rootId: string, adjacency: Map<string, any>) {
        // Compute depths for layout
        const depth = new Map([[rootId, 0]]);
        const q = [rootId];
        while (q.length) {
          const p = q.shift();
          for (const c of adjacency.get(p!) || []) {
            if (!depth.has(c)) {
              depth.set(c, (depth.get(p!) ?? 0) + 1);
              q.push(c);
            }
          }
        }
        const maxDepth = Math.max(...depth.values());
        return [depth, maxDepth];
      },
      createTerminalLeafBody(
        value,
        { i, numLeaves, terminalNodeId, terminalBody, canvasHeight }: CreateTerminalLeafBodyParams
      ) {
        const nodePos = terminalBody.position;
        const angle = (i / numLeaves) * Math.PI * 2;
        const radius = 25 + Math.random() * 20;
        const springs = this.acts.getSpringSettings(canvasHeight);

        const leafX = nodePos.x + Math.cos(angle) * radius;
        const leafY = nodePos.y + Math.sin(angle) * radius;

        const leafId = `terminal_leaf_${generateUUID()}`;

        // Create serializable leaf data
        const leafData: SerializableNodeData = {
          id: leafId,
          parentId: terminalNodeId,
          nodeType: 'terminal_leaf',
          constraintIds: [],
        };

        this.acts.addNode(leafData);
        const terminalLeafBody = Physics.createBody(
          leafData,
          springs,
          leafX,
          leafY,
          CFG.leafRadius,
          {
            frictionAir: CFG.airFriction * 1.5,
            inertia: Infinity, // Prevent rotation
            inverseInertia: 0, // No rotational inertia
            render: {
              fillStyle: '#32CD32', // Bright lime green for leaves
              strokeStyle: '#006400', // Dark green border
              lineWidth: 2,
            },
            collisionFilter: { group: -1 },
          }
        );

        // Assign random repulsion factor to this terminal leaf (0.0 to 0.4)
        // Terminal leaves can have slightly higher variation for more clustering
        (terminalLeafBody as any).repulsionFactor = Math.random() * 0.4;
        const constraintId = this.acts.connectNodes(
          terminalNodeId,
          leafId,
          springs.leafSpring.length,
          springs.leafSpring.stiffness,
          springs.leafSpring.damping,
          true
        );

        const constraintData = this.acts.getConstraint(constraintId);
        if (constraintData) {
          const physicsConstraint = Physics.createConstraint(constraintData);
          if (physicsConstraint) {
            Physics.addConstraintsToWorld([constraintId]);
            Physics.addBodiesToWorld([leafId]);
          }
        }
      },

      // Get node by ID (matches TreeDataManager.getNode())
      addConstraint(value: SerializableTreeState, constraintData: any): void {
        const forest = this as unknown as Forest<SerializableTreeState, any>;
        forest.mutate((draft) => {
          draft.constraints[constraintData.id] = constraintData;

          // Add constraint ID to parent node
          const parent = draft.nodes[constraintData.parentId];
          const child = draft.nodes[constraintData.childId];

          if (parent && !parent.constraintIds.includes(constraintData.id)) {
            parent.constraintIds.push(constraintData.id);
          }
          if (child && !child.constraintIds.includes(constraintData.id)) {
            child.constraintIds.push(constraintData.id);
          }
        });
      },

      // Add node (matches TreeDataManager.addNode())
      addLeafNodes(
        value: SerializableTreeState,
        parentNodeId: string,
        childNodeId: string,
        canvasHeight: number
      ): void {
        const forest = this as unknown as Forest<SerializableTreeState, any>;
        const numLeaves = 2 + Math.floor(Math.random() * 3); // 2-4 leaves
        const springs = forest.acts.getSpringSettings(canvasHeight);

        const parentBody = Physics.getBody(parentNodeId);
        const childBody = Physics.getBody(childNodeId);
        if (!parentBody || !childBody) {
          return;
        }

        for (let i = 0; i < numLeaves; i++) {
          const parentPos = parentBody.position;
          const childPos = childBody.position;
          const midX = (parentPos.x + childPos.x) / 2;
          const midY = (parentPos.y + childPos.y) / 2;

          // Add some randomness around the midpoint
          const offsetX = (Math.random() - 0.5) * 40;
          const offsetY = (Math.random() - 0.5) * 40;
          const leafX = midX + offsetX;
          const leafY = midY + offsetY;

          const leafId = `leaf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

          // Create serializable leaf node data first
          const leafNodeData = {
            id: leafId,
            nodeType: 'leaf' as const,
            constraintIds: [],
          };
          forest.acts.addNode(leafNodeData);

          // Create leaf body
          forest.acts.createBody(leafNodeData, leafX, leafY, 3, {
            frictionAir: 0.02,
            render: {
              fillStyle: '#90EE90',
              strokeStyle: '#228B22',
              lineWidth: 1,
            },
          });

          // Create constraint
          const constraintId = forest.acts.connectNodes(
            parentNodeId,
            leafId,
            springs.leafSpring.length,
            springs.leafSpring.stiffness,
            springs.leafSpring.damping,
            true
          );

          const constraintData = forest.acts.getConstraint(constraintId);
          if (constraintData) {
            const physicsConstraint = Physics.createConstraint(constraintData);
            if (physicsConstraint) {
              Physics.addConstraintsToWorld([constraintId]);
              Physics.addBodiesToWorld([leafId]);
            }
          }
        }
      },

      addNode(value: SerializableTreeState, nodeData: any): void {
        const forest = this as unknown as Forest<SerializableTreeState, any>;
        forest.mutate((draft) => {
          draft.nodes[nodeData.id] = nodeData;
        });
      },

      buildPhysicsTree(
        adjacency: Map<string, string[]>,
        rootId: string,
        canvasWidth: number,
        canvasHeight: number
      ): void {
        // Clear existing physics
        forest.acts.getPhysicsManager().clear();

        const [depth, maxDepth] = this.acts.makeDepth(rootId, adjacency);
        const counts = new Map();
        for (const [id, d] of depth) {
          counts.set(d, (counts.get(d) || 0) + 1);
        }
        const idxByDepth = new Map();

        // Create physics bodies and serializable nodes
        const bodyIds: string[] = [];

        // Create all nodes first
        const allNodeIds = new Set([rootId]);
        adjacency.forEach((children, parent) => {
          allNodeIds.add(parent);
          children.forEach((child) => allNodeIds.add(child));
        });

        allNodeIds.forEach((id) => {
          const bodyId = this.acts.createNodeAndBody(
            id,
            depth,
            idxByDepth,
            counts,
            canvasWidth,
            canvasHeight
          );
          bodyIds.push(bodyId);
        });

        // Add all bodies to physics world
        Physics.addBodiesToWorld(bodyIds);

        // Create constraints between connected nodes
        const constraintIds: string[] = [];

        adjacency.forEach((children, parentId) => {
          const parentDepth = depth.get(parentId) ?? 0;

          children.forEach((childId) => {
            const params: ProcessChildParams = {
              canvasHeight,
              childId,
              constraintIds,
              depth,
              maxDepth,
              parentDepth,
              parentId,
            };
            this.acts.processChildren(params);
          });
        });

        // Add terminal leaves to end nodes
        allNodeIds.forEach((nodeId) => {
          const children = adjacency.get(nodeId) || [];
          const nodeDepth = depth.get(nodeId) ?? 0;

          if (children.length === 0 && nodeDepth > 0) {
            this.addTerminalLeaves(nodeId, canvasHeight);
          }
        });

        // Add all constraints to physics world
        Physics.addConstraintsToWorld(constraintIds);

        console.log(`🔗 Created ${constraintIds.length} constraints`);
      },

      // Add constraint (matches TreeDataManager.addConstraint())
      clear(value: SerializableTreeState): void {
        const forest = this as unknown as Forest<SerializableTreeState, any>;
        forest.mutate(() => ({
          nodes: {},
          constraints: {},
          rootId: '',
        }));
      },

      // Get constraint by ID (matches TreeDataManager.getConstraint())
      connectNodes(
        value: SerializableTreeState,
        parentId: string,
        childId: string,
        length: number,
        stiffness: number,
        damping: number,
        isLeaf: boolean = false
      ): string {
        const forest = this as unknown as Forest<SerializableTreeState, any>;

        const parent = value.nodes[parentId];
        const child = value.nodes[childId];
        if (!parent || !child) {
          throw new Error('Parent or child node not found');
        }

        let constraintId = '';

        forest.mutate((draft) => {
          // Clean up any existing constraints to this child
          const childConstraintPattern = new RegExp(`_${childId}$`);
          const constraintsToRemove = Object.keys(draft.constraints).filter((id) =>
            childConstraintPattern.test(id)
          );

          constraintsToRemove.forEach((id) => {
            delete draft.constraints[id];
            // Remove from node constraint lists
            Object.values(draft.nodes).forEach((node: any) => {
              const index = node.constraintIds.indexOf(id);
              if (index > -1) {
                node.constraintIds.splice(index, 1);
              }
            });
          });

          // Update parent-child relationship
          draft.nodes[childId].parentId = parentId;

          // Create constraint metadata
          constraintId = `constraint_${parentId}_${childId}`;
          const constraintData: SerializableConstraintData = {
            id: constraintId,
            parentId,
            childId,
            length,
            stiffness,
            damping,
            isLeaf,
          };

          // Add constraint
          draft.constraints[constraintData.id] = constraintData;

          // Add constraint ID to parent and child nodes
          const parentNode = draft.nodes[constraintData.parentId];
          const childNode = draft.nodes[constraintData.childId];

          if (parentNode && !parentNode.constraintIds.includes(constraintData.id)) {
            parentNode.constraintIds.push(constraintData.id);
          }
          if (childNode && !childNode.constraintIds.includes(constraintData.id)) {
            childNode.constraintIds.push(constraintData.id);
          }
        });

        return constraintId;
      },

      // Get all constraints (matches TreeDataManager.getAllConstraints())
      createBody(
        value: SerializableTreeState,
        nodeData: SerializableNodeData,
        x: number,
        y: number,
        radius: number,
        options: any
      ): any {
        const forest = this as unknown as Forest<SerializableTreeState, any>;

        // Use imported Matter.js modules

        const body = Bodies.circle(x, y, radius, {
          ...options,
          label: nodeData.id,
        });

        // Store in resources
        let bodies = forest.res.get('matterBodies') as Map<string, any>;
        if (!bodies) {
          bodies = new Map();
          forest.res.set('matterBodies', bodies);
        }
        bodies.set(nodeData.id, body);

        // Add to world if it exists
        const world = forest.res.get('matterWorld');
        if (world) {
          World.add(world, body);
        }

        return body;
      },

      // Connect two nodes with constraint (matches TreeDataManager.connectNodes())
      createBranches(
        value: SerializableTreeState,
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

        if (numChildren === 0) {
          return;
        } // No children for this node

        const children: string[] = [];
        for (let i = 0; i < numChildren; i++) {
          const childId = `branch_${nodeCounter.value++}`;
          children.push(childId);
          const forest = this as unknown as Forest<SerializableTreeState, any>;
          forest.acts.createBranches(adjacency, childId, depth + 1, nodeCounter);
        }

        if (children.length > 0) {
          adjacency.set(parentId, children);
        }
      },

      // Generate random tree structure (matches TreeDataManager.generateRandomTree())
      createConstraint(
        value: SerializableTreeState,
        parentId: string,
        childId: string,
        length: number,
        stiffness: number,
        damping: number
      ): any {
        const forest = this as unknown as Forest<SerializableTreeState, any>;

        // Get bodies from resources
        const bodies = forest.res.get('matterBodies') as Map<string, any>;
        const parentBody = bodies?.get(parentId);
        const childBody = bodies?.get(childId);

        if (!parentBody || !childBody) {
          console.error(`Cannot create constraint: missing bodies for ${parentId} or ${childId}`);
          return null;
        }

        const constraint = Constraint.create({
          bodyA: parentBody,
          bodyB: childBody,
          length,
          stiffness,
          damping,
          render: { visible: true, strokeStyle: '#90EE90', lineWidth: 2 },
        });

        // Store in resources
        let constraints = forest.res.get('matterConstraints') as Map<string, any>;
        if (!constraints) {
          constraints = new Map();
          forest.res.set('matterConstraints', constraints);
        }

        const constraintId = `constraint_${parentId}_${childId}`;
        constraints.set(constraintId, constraint);

        // Add to world
        const world = forest.res.get('matterWorld');
        if (world) {
          World.add(world, constraint);
        }

        return constraint;
      },

      // Helper method for creating branches recursively
      createNodeAndBody(
        value: SerializableTreeState,
        id: string,
        depth: Map<string, number>,
        idxByDepth: Map<number, number>,
        counts: Map<number, number>,
        canvasWidth: number,
        canvasHeight: number
      ): string {
        const forest = this as unknown as Forest<SerializableTreeState, any>;

        const d = depth.get(id) ?? 0;
        const k = idxByDepth.get(d) || 0;
        idxByDepth.set(d, k + 1);
        const slots = counts.get(d);

        // Position calculation
        const spreadWidth = canvasWidth * 0.6;
        const nodePosition = ((k + 1) / (slots + 1)) * spreadWidth;
        const x = canvasWidth * 0.5 - spreadWidth * 0.5 + nodePosition;
        const y = canvasHeight - 80 - d * 45;

        // Create serializable node data
        const nodeData = {
          id,
          nodeType: 'branch' as const,
          constraintIds: [],
        };
        forest.acts.addNode(nodeData);

        // Create physics body
        forest.acts.createBody(nodeData, x, y, 8, {
          frictionAir: 0.01,
          inertia: Infinity,
          inverseInertia: 0,
          render: {
            fillStyle: '#DC143C',
            strokeStyle: '#8B0000',
            lineWidth: 1,
          },
        });

        return id;
      },

      // Tree structure queries (matches TreeDataManager methods)
      generateCompleteTree(
        value: SerializableTreeState,
        canvasWidth: number,
        canvasHeight: number
      ): string {
        console.log('🌳 Generating new tree with Forestry...');
        const forest = this as unknown as Forest<SerializableTreeState, any>;

        // 1. Generate tree structure (serializable)
        const { adjacency, rootId } = forest.acts.generateRandomTree();

        // 2. Build physics representation
        forest.acts.buildPhysicsTree(adjacency, rootId, canvasWidth, canvasHeight);

        console.log(`✅ Tree generated with ${forest.acts.getNodeCount()} nodes`);
        return rootId;
      },

      generateRandomTree(value: SerializableTreeState): {
        adjacency: Map<string, string[]>;
        rootId: string;
      } {
        const forest = this as unknown as Forest<SerializableTreeState, any>;

        // Clear existing state
        forest.mutate(() => ({
          nodes: {},
          constraints: {},
          rootId: '',
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
        forest.acts.createBranches(adjacency, currentTrunkNode, 0, nodeCounter);

        // Now create actual nodes in the store from the adjacency map
        const allNodeIds = new Set([rootId]);
        adjacency.forEach((children, parent) => {
          allNodeIds.add(parent);
          children.forEach(child => allNodeIds.add(child));
        });

        console.log('🌳 Creating nodes:', Array.from(allNodeIds));

        // Create nodes in the store
        allNodeIds.forEach(nodeId => {
          const nodeData = {
            id: nodeId,
            constraintIds: [],
            nodeType: nodeId === rootId ? 'branch' as const : 'branch' as const
          };
          forest.acts.addNode(nodeData);
        });

        forest.set('rootId', rootId);

        return { adjacency, rootId };
      },

      getAllConstraints(value: SerializableTreeState) {
        return Object.values(value.constraints);
      },

      // Tree traversal (matches TreeDataManager.traverse())
      getAllNodes(value: SerializableTreeState) {
        return Object.values(value.nodes);
      },

      // Utility methods
      getBody(value: SerializableTreeState, nodeId: string): any {
        const forest = this as unknown as Forest<SerializableTreeState, any>;
        const bodies = forest.res.get('matterBodies') as Map<string, any>;
        return bodies?.get(nodeId);
      },

      // Getters (matches TreeDataManager getters)
      getChildren(value: SerializableTreeState, nodeId: string) {
        return Object.values(value.nodes).filter((node) => node.parentId === nodeId);
      },

      getConstraint(value: SerializableTreeState, id: string) {
        return value.constraints[id];
      },

      // === PHYSICS BODY MANAGEMENT (from PhysicsManager) ===

      getNode(value: SerializableTreeState, id: string) {
        return value.nodes[id];
      },

      getNodeCount(value: SerializableTreeState): number {
        return Object.keys(value.nodes).length;
      },

      getParent(value: SerializableTreeState, nodeId: string) {
        const node = value.nodes[nodeId];
        if (!node?.parentId) {
          return undefined;
        }
        return value.nodes[node.parentId];
      },

      // === CONSTRAINT MANAGEMENT (from PhysicsManager) ===

      getRootId(value: SerializableTreeState): string {
        return value.rootId;
      },

      // === TREE OPERATIONS (from TreeController) ===

      getRootNodes(value: SerializableTreeState) {
        return Object.values(value.nodes).filter((node) => !node.parentId);
      },

      // Create node and body (from TreeController.createNodeAndBody)
      getSpringSettings(value: SerializableTreeState, canvasHeight: number) {
        return {
          spring: {
            length: canvasHeight * CFG.springLengthPercent,
            stiffness: CFG.springStiffness,
            damping: CFG.springDamping,
          },
          twigSpring: {
            length: canvasHeight * CFG.twigSpringLengthPercent,
            stiffness: CFG.twigSpringStiffness,
            damping: CFG.twigSpringDamping,
          },
          leafSpring: {
            length: canvasHeight * CFG.leafSpringLengthPercent,
            stiffness: CFG.leafSpringStiffness,
            damping: CFG.leafSpringDamping,
          },
        };
      },

      // Calculate spring settings based on canvas size (from TreeController.getSpringSettings)
      processChildren(
        value: SerializableTreeState,
        {
          childId,
          parentId,
          depth,
          parentDepth,
          maxDepth,
          canvasHeight,
          constraintIds,
        }: ProcessChildParams
      ) {
        const springs = this.acts.getSpringSettings(canvasHeight);

        const childDepth = depth.get(childId) ?? 0;

        // Calculate spring settings based on depth
        const depthFactor = childDepth / maxDepth;
        const springLength = springs.spring.length * (1 - depthFactor * 0.4);
        const springStiffness = springs.spring.stiffness * (1 + depthFactor * 2);
        const springDamping = springs.spring.damping * (1 + depthFactor * 0.5);

        // Create constraint in data layer
        const constraintId = this.acts.connectNodes(
          parentId,
          childId,
          springLength,
          springStiffness,
          springDamping,
          false
        );

        // Create physics constraint
        const constraintData = this.acts.getConstraint(constraintId);
        if (constraintData) {
          const physicsConstraint = Physics.createConstraint(constraintData);
          if (physicsConstraint) {
            constraintIds.push(constraintId);
          }
        }

        // Add leaf nodes between parent and child (skip for root level)
        if (parentDepth > 0) {
          this.acts.addLeafNodes(parentId, childId, canvasHeight);
        }
      },

      // Update spring lengths (from TreeController.updateSpringLengths)
      removeBody(value: SerializableTreeState, nodeId: string): boolean {
        const forest = this as unknown as Forest<SerializableTreeState, any>;
        const bodies = forest.res.get('matterBodies') as Map<string, any>;
        const body = bodies?.get(nodeId);
        if (!body) {
          return false;
        }

        // Remove from world
        const world = forest.res.get('matterWorld');
        if (world) {
          import('matter-js').then(({ World }) => {
            World.remove(world, body);
          });
        }

        // Remove from resources
        bodies.delete(nodeId);
        return true;
      },

      // Add leaf nodes between parent and child (from TreeController.addLeafNodes)
      removeNode(value: SerializableTreeState, nodeId: string): boolean {
        if (!value.nodes[nodeId]) {
          return false;
        }

        const forest = this as unknown as Forest<SerializableTreeState, any>;
        forest.mutate((draft) => {
          // Remove node
          delete draft.nodes[nodeId];

          // Remove associated constraints
          const constraintsToRemove = Object.keys(draft.constraints).filter(
            (id) =>
              draft.constraints[id].parentId === nodeId || draft.constraints[id].childId === nodeId
          );

          constraintsToRemove.forEach((id) => delete draft.constraints[id]);
        });

        return true;
      },

      scaleTree(
        value: SerializableTreeState,
        oldWidth: number,
        oldHeight: number,
        newWidth: number,
        newHeight: number
      ): void {
        const forest = this as unknown as Forest<SerializableTreeState, any>;
        const scaleX = newWidth / oldWidth;
        const scaleY = newHeight / oldHeight;
        const oldCenterX = oldWidth * 0.5;
        const oldCenterY = oldHeight * 0.5;
        const newCenterX = newWidth * 0.5;
        const newCenterY = newHeight * 0.5;

        // Scale all physics bodies from old center to new center
        Physics.scaleAllPositions(scaleX, scaleY, oldCenterX, oldCenterY, newCenterX, newCenterY);

        // Update spring lengths for new canvas size
        forest.acts.updateSpringLengths(newHeight);

        console.log(`✅ Tree scaling complete`);
      },

      // Generate complete tree (from TreeController.generateTree)
      traverse(
        value: SerializableTreeState,
        nodeId: string,
        fn: (node: SerializableNodeData) => void
      ): void {
        const forest = this as unknown as Forest<SerializableTreeState, any>;
        const node = value.nodes[nodeId];
        if (!node) {
          return;
        }

        fn(node);
        const children = forest.acts.getChildren(nodeId);
        for (const child of children) {
          forest.acts.traverse(child.id, fn);
        }
      },

      generateTree(canvasWidth: number, canvasHeight: number): string {
        console.log('🌳 Generating new tree...');
        const forest = this as unknown as Forest<SerializableTreeState, any>;

        // 1. Generate tree structure (serializable)
        const { adjacency, rootId } = forest.acts.generateRandomTree();

        // 2. Build physics representation
        this.acts.buildPhysicsTree(adjacency, rootId, canvasWidth, canvasHeight);

        console.log(`✅ Tree generated with ${forest.acts.getNodeCount()} nodes`);
        return rootId;
      },

      updateSpringLengths(value: SerializableTreeState, canvasHeight: number): void {
        const store = this as unknown as Forest<SerializableTreeState, any>;
        const springs = store.acts.getSpringSettings(canvasHeight);

        store.acts.traverse(forest.acts.getRootId(), (node) => {
          node.constraintIds.forEach((constraintId) => {
            const constraintData = forest.acts.getConstraint(constraintId);
            if (constraintData) {
              const physicsConstraint = Physics.getConstraint(constraintId);
              if (physicsConstraint) {
                // Update constraint length based on type
                const newLength = constraintData.isLeaf
                  ? springs.leafSpring.length
                  : springs.spring.length;
                physicsConstraint.length = newLength;
              }
            }
          });
        });
      },
    },
  });

  // Resources will be created later when canvas is available
  // Auto-generate tree structure (no physics yet)
  console.log('🌳 Creating tree structure with dimensions:', canvasWidth, 'x', canvasHeight);
  const { adjacency, rootId } = forest.acts.generateRandomTree();

  console.log(
    '✅ ForestryTreeData created with',
    forest.acts.getNodeCount(),
    'nodes (physics resources pending)'
  );
  return forest;
}
