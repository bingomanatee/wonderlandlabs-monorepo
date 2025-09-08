import { Bodies, Body, Constraint, World } from 'matter-js';
import { RESOURCES } from './constants';
import type { StoreIF } from '@wonderlandlabs/forestry4';
import type { SerializableTreeState, TreeDataActions } from './ForestryTreeData';
import type {
  MatterBody,
  MatterConstraint,
  MatterWorld,
  SerializableConstraintData,
  SerializableNodeData,
} from './types';

// Manages non-serializable Matter.js physics objects
// Now uses ForestryTreeData resources for storage
export class PhysicsManager {
  private forestryStore: StoreIF<SerializableTreeState>;

  constructor(forestryStore: StoreIF<SerializableTreeState>) {
    this.forestryStore = forestryStore;
  }

  // Constraint management
  createConstraint(constraintData: SerializableConstraintData): MatterConstraint | null {
    const parentBody = this.forestryStore.acts.getPhysicsBody(constraintData.parentId);
    const childBody = this.forestryStore.acts.getPhysicsBody(constraintData.childId);

    if (!parentBody || !childBody) {
      console.error(`Cannot create constraint ${constraintData.id}: missing bodies`);
      return null;
    }

    const constraint = Constraint.create({
      bodyA: parentBody,
      bodyB: childBody,
      length: constraintData.length,
      stiffness: constraintData.stiffness,
      damping: constraintData.damping,
      render: {
        strokeStyle: constraintData.isLeaf ? '#4a9d4a' : '#6af08e',
        lineWidth: constraintData.isLeaf ? 1 : 2,
      },
    });

    // Store in ForestryTreeData instead of local Map
    const constraints = this.forestryStore.res.get('matterConstraints') as Map<string, any>;
    constraints.set(constraintData.id, constraint);
    return constraint;
  }

  getConstraint(constraintId: string): MatterConstraint | undefined {
    // Get from ForestryTreeData instead of local Map
    const constraints = this.forestryStore.res.get('matterConstraints') as Map<string, any>;
    return constraints?.get(constraintId);
  }

  // Batch operations
  addBodiesToWorld(nodeIds: string[]): void {
    const world = this.forestryStore.res.get(RESOURCES.WORLD) as MatterWorld;
    if (!world) return;

    const bodies = nodeIds
      .map((id) => this.forestryStore.acts.getPhysicsBody(id))
      .filter(Boolean) as MatterBody[];
    if (bodies.length > 0) {
      World.add(world, bodies);
    }
  }

  addConstraintsToWorld(constraintIds: string[]): void {
    const world = this.forestryStore.res.get(RESOURCES.WORLD) as MatterWorld;
    if (!world) return;

    const constraints = constraintIds
      .map((id) => this.getConstraint(id))
      .filter(Boolean) as MatterConstraint[];
    if (constraints.length > 0) {
      World.add(world, constraints);
    }
  }

  // Scale all body positions (for resize)
  scaleAllPositions(
    scaleX: number,
    scaleY: number,
    oldCenterX: number,
    oldCenterY: number,
    newCenterX: number,
    newCenterY: number
  ): void {
    // Get bodies from ForestryTreeData instead of local Map
    const bodies = this.forestryStore.res.get('matterBodies') as Map<string, any>;

    console.log(
      `🔄 Scaling ${bodies?.size || 0} bodies by ${scaleX.toFixed(3)}x${scaleY.toFixed(3)}`
    );
    console.log(`📍 From center (${oldCenterX}, ${oldCenterY}) to (${newCenterX}, ${newCenterY})`);

    bodies?.forEach((body, nodeId) => {
      // Calculate relative position from old center
      const relativeX = body.position.x - oldCenterX;
      const relativeY = body.position.y - oldCenterY;

      // Scale the relative position and apply to new center
      const newX = newCenterX + relativeX * scaleX;
      const newY = newCenterY + relativeY * scaleY;

      Body.setPosition(body, { x: newX, y: newY });
      Body.setVelocity(body, { x: 0, y: 0 }); // Reset velocity
    });

    console.log(`✅ All bodies repositioned`);
  }

  // Clear all physics objects
  clear(): void {
    const world = this.forestryStore.res.get(RESOURCES.WORLD) as MatterWorld;

    if (world) {
      // Get from ForestryTreeData and remove from world
      const bodies = this.forestryStore.res.get('matterBodies') as Map<string, any>;
      const constraints = this.forestryStore.res.get('matterConstraints') as Map<string, any>;
      const allObjects = [
        ...(bodies ? Array.from(bodies.values()) : []),
        ...(constraints ? Array.from(constraints.values()) : []),
      ];
      World.remove(world, allObjects);
    }

    // Clear ForestryTreeData resources
    const bodies = this.forestryStore.res.get('matterBodies') as Map<string, any>;
    const constraints = this.forestryStore.res.get('matterConstraints') as Map<string, any>;
    bodies?.clear();
    constraints?.clear();
  }

  get constraints() {
    return this.forestryStore.res.get('matterConstraints') as Map<string, any>;
  }
}

// PhysicsManager is now instantiated with a forestry store parameter
// No more global singleton - create instances as needed
