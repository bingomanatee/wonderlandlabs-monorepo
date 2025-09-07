import { Physics } from './PhysicsManager';
import { CFG } from './constants';
import type { SerializableNodeData } from './deprecated/types-matter';
import { forestryTreeData } from './ForestryTreeData';

// Simple UUID generator
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

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

    // Calculate spring settings based on canvas size
    const springs = this.getSpringSettings(canvasHeight);

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
    const counts = new Map();
    for (const [id, d] of depth) counts.set(d, (counts.get(d) || 0) + 1);
    const idxByDepth = new Map();

    // Create physics bodies and serializable nodes
    const bodyIds: string[] = [];

    const createNodeAndBody = (id: string): void => {
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
      const nodeData: SerializableNodeData = {
        id,
        nodeType: 'branch',
        constraintIds: [],
      };
      forestryTreeData.acts.addNode(nodeData);

      // Create physics body with low inertia
      const body = Physics.createBody(nodeData, x, y, CFG.nodeRadius, {
        frictionAir: CFG.airFriction,
        inertia: Infinity, // Prevent rotation for more stable movement
        inverseInertia: 0, // No rotational inertia
        render: {
          fillStyle: '#DC143C', // Crimson red for branches
          strokeStyle: '#8B0000', // Dark red border
          lineWidth: 2,
        },
        collisionFilter: { group: -1 }, // Prevent collisions between tree nodes
      });

      // Branches have full repulsion strength
      (body as any).repulsionFactor = 1.0;

      bodyIds.push(id);
    };

    // Create all nodes first
    const allNodeIds = new Set([rootId]);
    adjacency.forEach((children, parent) => {
      allNodeIds.add(parent);
      children.forEach((child) => allNodeIds.add(child));
    });

    allNodeIds.forEach((id) => createNodeAndBody(id));

    // Add all bodies to physics world
    Physics.addBodiesToWorld(bodyIds);

    // Create constraints between connected nodes
    const constraintIds: string[] = [];

    adjacency.forEach((children, parentId) => {
      const parentDepth = depth.get(parentId) ?? 0;

      children.forEach((childId) => {
        const childDepth = depth.get(childId) ?? 0;

        // Calculate spring settings based on depth
        const depthFactor = childDepth / maxDepth;
        const springLength = springs.spring.length * (1 - depthFactor * 0.4);
        const springStiffness = springs.spring.stiffness * (1 + depthFactor * 2);
        const springDamping = springs.spring.damping * (1 + depthFactor * 0.5);

        // Create constraint in data layer
        const constraintId = forestryTreeData.acts.connectNodes(
          parentId,
          childId,
          springLength,
          springStiffness,
          springDamping,
          false
        );

        // Create physics constraint
        const constraintData = forestryTreeData.acts.getConstraint(constraintId);
        if (constraintData) {
          const physicsConstraint = Physics.createConstraint(constraintData);
          if (physicsConstraint) {
            constraintIds.push(constraintId);
          }
        }

        // Add leaf nodes between parent and child (skip for root level)
        if (parentDepth > 0) {
          this.addLeafNodes(parentId, childId, canvasHeight);
        }
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

  // Add leaf nodes between parent and child
  private addLeafNodes(parentNodeId: string, childNodeId: string, canvasHeight: number): void {
    const numLeaves = 2 + Math.floor(Math.random() * 3); // 2-4 leaves
    const springs = this.getSpringSettings(canvasHeight);

    const parentBody = Physics.getBody(parentNodeId);
    const childBody = Physics.getBody(childNodeId);
    if (!parentBody || !childBody) return;

    for (let i = 0; i < numLeaves; i++) {
      const parentPos = parentBody.position;
      const childPos = childBody.position;
      const midX = (parentPos.x + childPos.x) * 0.5;
      const midY = (parentPos.y + childPos.y) * 0.5;

      const offsetX = (Math.random() - 0.5) * 60;
      const offsetY = (Math.random() - 0.5) * 40;

      const leafId = `leaf_${generateUUID()}`;

      // Create serializable leaf data
      const leafData: SerializableNodeData = {
        id: leafId,
        parentId: parentNodeId,
        nodeType: 'leaf',
        constraintIds: [],
      };
      forestryTreeData.acts.addNode(leafData);

      // Create physics body with low inertia
      const leafBody = Physics.createBody(
        leafData,
        midX + offsetX,
        midY + offsetY,
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

      // Assign random repulsion factor to this leaf (0.0 to 0.3)
      // Lower values allow leaves to cluster and overlap
      (leafBody as any).repulsionFactor = Math.random() * 0.3;

      // Create constraint
      const constraintId = forestryTreeData.acts.connectNodes(
        parentNodeId,
        leafId,
        springs.leafSpring.length,
        springs.leafSpring.stiffness,
        springs.leafSpring.damping,
        true
      );

      const constraintData = forestryTreeData.acts.getConstraint(constraintId);
      if (constraintData) {
        const physicsConstraint = Physics.createConstraint(constraintData);
        if (physicsConstraint) {
          Physics.addConstraintsToWorld([constraintId]);
          Physics.addBodiesToWorld([leafId]);
        }
      }
    }
  }

  // Add terminal leaves to end nodes
  private addTerminalLeaves(terminalNodeId: string, canvasHeight: number): void {
    const numLeaves = 3 + Math.floor(Math.random() * 4); // 3-6 leaves
    const springs = this.getSpringSettings(canvasHeight);

    const terminalBody = Physics.getBody(terminalNodeId);
    if (!terminalBody) return;

    for (let i = 0; i < numLeaves; i++) {
      const nodePos = terminalBody.position;
      const angle = (i / numLeaves) * Math.PI * 2;
      const radius = 25 + Math.random() * 20;

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
      forestryTreeData.acts.addNode(leafData);

      // Create physics body with low inertia
      const terminalLeafBody = Physics.createBody(leafData, leafX, leafY, CFG.leafRadius, {
        frictionAir: CFG.airFriction * 1.5,
        inertia: Infinity, // Prevent rotation
        inverseInertia: 0, // No rotational inertia
        render: {
          fillStyle: '#32CD32', // Bright lime green for leaves
          strokeStyle: '#006400', // Dark green border
          lineWidth: 2,
        },
        collisionFilter: { group: -1 },
      });

      // Assign random repulsion factor to this terminal leaf (0.0 to 0.4)
      // Terminal leaves can have slightly higher variation for more clustering
      (terminalLeafBody as any).repulsionFactor = Math.random() * 0.4;

      // Create constraint
      const constraintId = forestryTreeData.acts.connectNodes(
        terminalNodeId,
        leafId,
        springs.leafSpring.length,
        springs.leafSpring.stiffness,
        springs.leafSpring.damping,
        true
      );

      const constraintData = forestryTreeData.acts.getConstraint(constraintId);
      if (constraintData) {
        const physicsConstraint = Physics.createConstraint(constraintData);
        if (physicsConstraint) {
          Physics.addConstraintsToWorld([constraintId]);
          Physics.addBodiesToWorld([leafId]);
        }
      }
    }
  }

  // Calculate spring settings based on canvas size
  private getSpringSettings(canvasHeight: number) {
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
  }

  // Removed unused methods: getSerializableState, loadFromState, cleanupUnconstrainedBodies

  // Update spring lengths (for resize)
  updateSpringLengths(canvasHeight: number): void {
    const springs = this.getSpringSettings(canvasHeight);

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

  // Scale tree for resize
  scaleTree(oldWidth: number, oldHeight: number, newWidth: number, newHeight: number): void {
    console.log(`🔄 Scaling tree from ${oldWidth}x${oldHeight} to ${newWidth}x${newHeight}`);

    const scaleX = newWidth / oldWidth;
    const scaleY = newHeight / oldHeight;
    const oldCenterX = oldWidth * 0.5;
    const oldCenterY = oldHeight * 0.5;
    const newCenterX = newWidth * 0.5;
    const newCenterY = newHeight * 0.5;

    // Scale all physics bodies from old center to new center
    Physics.scaleAllPositions(scaleX, scaleY, oldCenterX, oldCenterY, newCenterX, newCenterY);

    // Update spring lengths for new canvas size
    this.updateSpringLengths(newHeight);

    console.log(`✅ Tree scaling complete`);
  }
}

// Global instance
export const treeController = new TreeController();
