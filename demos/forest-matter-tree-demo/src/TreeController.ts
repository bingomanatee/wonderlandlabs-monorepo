import { Physics } from './PhysicsManager';
import {
  CreateTerminalLeafBodyParams,
  forestryTreeData,
  ProcessChildParams,
} from './ForestryTreeData';

// Coordinates between serializable data and physics runtime
export class TreeController {
  // Generate and build a complete tree
  generateTree(canvasWidth: number, canvasHeight: number): string {
    console.log('🌳 Generating new tree...');

    // 1. Generate tree structure (serializable)
    const { adjacency, rootId } = forestryTreeData.acts.generateRandomTree();

    // 2. Build physics representation
    this.buildPhysicsTree(adjacency, rootId, canvasWidth, canvasHeight);

    console.log(`✅ Tree generated with ${forestryTreeData.acts.getNodeCount()} nodes`);
    return rootId;
  }

  // Build physics objects from tree structure
  private buildPhysicsTree(
    adjacency: Map<string, string[]>,
    rootId: string,
    canvasWidth: number,
    canvasHeight: number
  ): void {
    // Clear existing physics
    Physics.clear();

    const [depth, maxDepth] = forestryTreeData.acts.makeDepth(rootId, adjacency);
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
      const bodyId = forestryTreeData.acts.createNodeAndBody(
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
        forestryTreeData.acts.processChildren(params);
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
  }

  // Add terminal leaves to end nodes
  private addTerminalLeaves(terminalNodeId: string, canvasHeight: number): void {
    const numLeaves = 3 + Math.floor(Math.random() * 4); // 3-6 leaves
    const terminalBody = Physics.getBody(terminalNodeId);
    if (!terminalBody) {
      return;
    }

    for (let i = 0; i < numLeaves; i++) {
      const params: CreateTerminalLeafBodyParams = {
        i,
        canvasHeight,
        numLeaves,
        terminalBody,
        terminalNodeId,
      };
      forestryTreeData.acts.createTerminalLeafBody(params);
    }
  }

  // getSpringSettings moved to ForestryTreeData

  // Removed unused methods: getSerializableState, loadFromState, cleanupUnconstrainedBodies

  // Update spring lengths (for resize)
  updateSpringLengths(canvasHeight: number): void {
    const springs = forestryTreeData.acts.getSpringSettings(canvasHeight);

    forestryTreeData.acts.traverse(forestryTreeData.acts.getRootId(), (node) => {
      node.constraintIds.forEach((constraintId) => {
        const constraintData = forestryTreeData.acts.getConstraint(constraintId);
        if (constraintData) {
          const newLength = constraintData.isLeaf
            ? springs.leafSpring.length
            : springs.spring.length;

          // Update both data and physics
          constraintData.length = newLength;
          Physics.updateConstraint(constraintId, { length: newLength });
        }
      });
    });
  }

  // Scale tree for resize - now delegates to Forestry
  scaleTree(oldWidth: number, oldHeight: number, newWidth: number, newHeight: number): void {
    forestryTreeData.acts.scaleTree(oldWidth, oldHeight, newWidth, newHeight);
  }
}

// Global instance
export const treeController = new TreeController();
