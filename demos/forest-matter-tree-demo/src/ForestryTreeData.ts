import { Forest } from '@wonderlandlabs/forestry4';
import { Bodies, World, Constraint, Body } from 'matter-js';

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

// Forestry store that mirrors TreeDataManager's state structure
export function createForestryTreeData() {

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
      ['matterRunner', null]
    ]),
    actions: {
      // Note: getState() and loadState() removed - use forest.value and forest.next() directly

      // Get node by ID (matches TreeDataManager.getNode())
      getNode(value: SerializableTreeState, id: string) {
        return value.nodes[id];
      },

      // Add node (matches TreeDataManager.addNode())
      addNode(value: SerializableTreeState, nodeData: any): void {
        const forest = this as unknown as Forest<SerializableTreeState, any>;
        forest.mutate((draft) => {
          draft.nodes[nodeData.id] = nodeData;
        });
      },

      // Remove node (matches TreeDataManager.removeNode())
      removeNode(value: SerializableTreeState, nodeId: string): boolean {
        if (!value.nodes[nodeId]) return false;

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

      // Get all nodes (matches TreeDataManager.getAllNodes())
      getAllNodes(value: SerializableTreeState) {
        return Object.values(value.nodes);
      },

      // Add constraint (matches TreeDataManager.addConstraint())
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

      // Get constraint by ID (matches TreeDataManager.getConstraint())
      getConstraint(value: SerializableTreeState, id: string) {
        return value.constraints[id];
      },

      // Get all constraints (matches TreeDataManager.getAllConstraints())
      getAllConstraints(value: SerializableTreeState) {
        return Object.values(value.constraints);
      },

      // Connect two nodes with constraint (matches TreeDataManager.connectNodes())
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
        if (!parent || !child) throw new Error('Parent or child node not found');

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

      // Generate random tree structure (matches TreeDataManager.generateRandomTree())
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

        forest.set('rootId', rootId);

        return { adjacency, rootId };
      },

      // Helper method for creating branches recursively
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

        if (numChildren === 0) return; // No children for this node

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

      // Tree structure queries (matches TreeDataManager methods)
      getChildren(value: SerializableTreeState, nodeId: string) {
        return Object.values(value.nodes).filter((node) => node.parentId === nodeId);
      },

      getParent(value: SerializableTreeState, nodeId: string) {
        const node = value.nodes[nodeId];
        if (!node?.parentId) return undefined;
        return value.nodes[node.parentId];
      },

      getRootNodes(value: SerializableTreeState) {
        return Object.values(value.nodes).filter((node) => !node.parentId);
      },

      // Tree traversal (matches TreeDataManager.traverse())
      traverse(
        value: SerializableTreeState,
        nodeId: string,
        fn: (node: SerializableNodeData) => void
      ): void {
        const forest = this as unknown as Forest<SerializableTreeState, any>;
        const node = value.nodes[nodeId];
        if (!node) return;

        fn(node);
        const children = forest.acts.getChildren(nodeId);
        for (const child of children) {
          forest.acts.traverse(child.id, fn);
        }
      },

      // Utility methods
      clear(value: SerializableTreeState): void {
        const forest = this as unknown as Forest<SerializableTreeState, any>;
        forest.mutate(() => ({
          nodes: {},
          constraints: {},
          rootId: '',
        }));
      },

      // Getters (matches TreeDataManager getters)
      getNodeCount(value: SerializableTreeState): number {
        return Object.keys(value.nodes).length;
      },

      getRootId(value: SerializableTreeState): string {
        return value.rootId;
      },

      // === PHYSICS BODY MANAGEMENT (from PhysicsManager) ===

      createBody(value: SerializableTreeState, nodeData: SerializableNodeData, x: number, y: number, radius: number, options: any): any {
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

      getBody(value: SerializableTreeState, nodeId: string): any {
        const forest = this as unknown as Forest<SerializableTreeState, any>;
        const bodies = forest.res.get('matterBodies') as Map<string, any>;
        return bodies?.get(nodeId);
      },

      removeBody(value: SerializableTreeState, nodeId: string): boolean {
        const forest = this as unknown as Forest<SerializableTreeState, any>;
        const bodies = forest.res.get('matterBodies') as Map<string, any>;
        const body = bodies?.get(nodeId);
        if (!body) return false;

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

      // === CONSTRAINT MANAGEMENT (from PhysicsManager) ===

      createConstraint(value: SerializableTreeState, parentId: string, childId: string, length: number, stiffness: number, damping: number): any {
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
          render: { visible: true, strokeStyle: '#90EE90', lineWidth: 2 }
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

      // === TREE OPERATIONS (from TreeController) ===

      scaleTree(value: SerializableTreeState, oldWidth: number, oldHeight: number, newWidth: number, newHeight: number): void {
        console.log(`🔄 Scaling tree from ${oldWidth}x${oldHeight} to ${newWidth}x${newHeight}`);

        const forest = this as unknown as Forest<SerializableTreeState, any>;
        const scaleX = newWidth / oldWidth;
        const scaleY = newHeight / oldHeight;
        const oldCenterX = oldWidth * 0.5;
        const oldCenterY = oldHeight * 0.5;
        const newCenterX = newWidth * 0.5;
        const newCenterY = newHeight * 0.5;

        // Scale all bodies
        const bodies = forest.res.get('matterBodies') as Map<string, any>;
        if (bodies) {
          bodies.forEach((body) => {
            const relativeX = body.position.x - oldCenterX;
            const relativeY = body.position.y - oldCenterY;

            Body.setPosition(body, {
              x: newCenterX + relativeX * scaleX,
              y: newCenterY + relativeY * scaleY
            });
          });
        }
      },

      // Generate complete tree (from TreeController.generateTree)
      generateCompleteTree(value: SerializableTreeState, canvasWidth: number, canvasHeight: number): string {
        console.log('🌳 Generating new tree with Forestry...');
        const forest = this as unknown as Forest<SerializableTreeState, any>;

        // 1. Generate tree structure (serializable)
        const { adjacency, rootId } = forest.acts.generateRandomTree();

        // 2. Build physics representation
        forest.acts.buildPhysicsTree(adjacency, rootId, canvasWidth, canvasHeight);

        console.log(`✅ Tree generated with ${forest.acts.getNodeCount()} nodes`);
        return rootId;
      },

      // Build physics tree (from TreeController.buildPhysicsTree)
      buildPhysicsTree(value: SerializableTreeState, adjacency: Map<string, string[]>, rootId: string, canvasWidth: number, canvasHeight: number): void {
        const forest = this as unknown as Forest<SerializableTreeState, any>;

        // Clear existing physics
        // Note: Physics.clear() still needed for now
        import('./PhysicsManager').then(({ Physics }) => {
          Physics.clear();
        });

        // Create all nodes and bodies
        const allNodeIds = new Set([rootId]);
        adjacency.forEach((children, parent) => {
          allNodeIds.add(parent);
          children.forEach(child => allNodeIds.add(child));
        });

        // Create nodes and bodies for each
        allNodeIds.forEach(nodeId => {
          // Create serializable node data
          const nodeData = {
            id: nodeId,
            nodeType: nodeId === rootId ? 'branch' as const : 'branch' as const,
            constraintIds: [],
          };
          forest.acts.addNode(nodeData);

          // Create physics body (simplified positioning for now)
          const x = canvasWidth * 0.5 + (Math.random() - 0.5) * 200;
          const y = canvasHeight - 100 - Math.random() * 300;

          forest.acts.createBody(nodeData, x, y, 8, {
            frictionAir: 0.01,
            render: { fillStyle: '#228B22' }
          });
        });

        // Create constraints between connected nodes
        adjacency.forEach((children, parentId) => {
          children.forEach(childId => {
            const constraintId = forest.acts.connectNodes(parentId, childId, 50, 0.8, 0.1, false);
            // Physics constraint creation handled by connectNodes
          });
        });
      },
    },
  });

  console.log('Forest created successfully:', forest);
  return forest;
}

// Global instance (matching TreeDataManager pattern)
export const forestryTreeData = createForestryTreeData();

// Debug logging
console.log('ForestryTreeData created:', forestryTreeData);
console.log('ForestryTreeData acts:', forestryTreeData.acts);
