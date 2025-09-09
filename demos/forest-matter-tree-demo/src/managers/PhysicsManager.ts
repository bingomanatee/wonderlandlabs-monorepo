import { Bodies, Body, Constraint, World } from 'matter-js';
import { globalResources, RESOURCES } from './constants';
import type {
  MatterBody,
  MatterConstraint,
  MatterWorld,
  SerializableNodeData,
  SerializableConstraintData,
} from './types';
import { TreeStoreData } from './forestDataStore';
import type { StoreIF } from '@wonderlandlabs/forestry4';
// Manages non-serializable Matter.js physics objects
export class PhysicsManager {
  private store: StoreIF<TreeStoreData>;

  get bodies() {
    return this.store.res.get(RESOURCES.BODIES);
  }

  get constraints() {
    return this.store.res.get(RESOURCES.CONSTRAINTS);
  }

  constructor(store: StoreIF<TreeStoreData>) {
    console.log('new physics manager');
    this.store = store;
  }
  // Body management
  createBody(
    nodeData: SerializableNodeData,
    x: number,
    y: number,
    radius: number,
    options: any
  ): MatterBody {
    const body = Bodies.circle(x, y, radius, {
      ...options,
      label: nodeData.id,
    });

    this.bodies.set(nodeData.id, body);
    return body;
  }

  getBody(nodeId: string): MatterBody | undefined {
    return this.bodies.get(nodeId);
  }

  removeBody(nodeId: string): boolean {
    const body = this.bodies.get(nodeId);
    if (!body) return false;

    // Remove from physics world
    const world = this.store.res.get(RESOURCES.WORLD) as MatterWorld;
    if (world) {
      World.remove(world, body);
    }

    // Remove from our tracking
    this.bodies.delete(nodeId);
    return true;
  }

  getAllBodies(): MatterBody[] {
    return Array.from(this.bodies.values());
  }

  // Constraint management
  createConstraint(constraintData: SerializableConstraintData): MatterConstraint | null {
    const bodies = this.store.res.get(RESOURCES.BODIES);
    const parentBody = bodies.get(constraintData.parentId);
    const childBody = bodies.get(constraintData.childId);

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

    this.constraints.set(constraintData.id, constraint);
    return constraint;
  }

  // Update constraint properties
  updateConstraint(
    constraintId: string,
    updates: Partial<{ length: number; stiffness: number; damping: number }>
  ): boolean {
    const constraint = this.store.getRes([RESOURCES.CONSTRAINTS, constraintId]);
    if (!constraint) return false;

    if (updates.length !== undefined) constraint.length = updates.length;
    if (updates.stiffness !== undefined) constraint.stiffness = updates.stiffness;
    if (updates.damping !== undefined) constraint.damping = updates.damping;

    return true;
  }

  // Batch operations
  addBodiesToWorld(nodeIds: string[]): void {
    const world = this.store.res.get(RESOURCES.WORLD) as MatterWorld;
    if (!world) return;

    const bodies = nodeIds
      .map((id) => this.store.res.get(RESOURCES.BODIES).get(id))
      .filter(Boolean) as MatterBody[];
    if (bodies.length > 0) {
      World.add(world, bodies);
    }
  }

  addConstraintsToWorld(constraintIds: string[]): void {
    const world = this.store.res.get(RESOURCES.WORLD) as MatterWorld;
    if (!world) return;

    const constraints = constraintIds
      .map((id) => this.store.getRes([RESOURCES.CONSTRAINTS, id]))
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
    this.bodies.forEach((body, nodeId) => {
      // Calculate relative position from old center
      const relativeX = body.position.x - oldCenterX;
      const relativeY = body.position.y - oldCenterY;

      // Scale the relative position and apply to new center
      const newX = newCenterX + relativeX * scaleX;
      const newY = newCenterY + relativeY * scaleY;

      Body.setPosition(body, { x: newX, y: newY });
      Body.setVelocity(body, { x: 0, y: 0 }); // Reset velocity
    });
  }

  // Find unconstrained bodies
  findUnconstrainedBodies(rootNodeId: string): string[] {
    const unconstrainedIds: string[] = [];

    this.bodies.forEach((body, nodeId) => {
      if (nodeId === rootNodeId) return; // Root is special (has rootPin)

      // Check if this body is referenced by any constraint
      let isConstrained = false;
      for (const constraint of this.constraints.values()) {
        if (constraint.bodyA?.label === nodeId || constraint.bodyB?.label === nodeId) {
          isConstrained = true;
          break;
        }
      }

      if (!isConstrained) {
        unconstrainedIds.push(nodeId);
      }
    });

    return unconstrainedIds;
  }

  // Clear all physics objects
  clear(): void {
    const world = this.store.res.get(RESOURCES.WORLD) as MatterWorld;

    if (world) {
      // Remove all bodies and constraints from world
      World.remove(world, [...this.bodies.values(), ...this.constraints.values()]);
    }

    this.bodies.clear();
    this.constraints.clear();
  }
}
