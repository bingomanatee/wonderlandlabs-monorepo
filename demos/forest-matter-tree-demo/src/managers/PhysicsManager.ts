import { Bodies, Body, Constraint, World } from 'matter-js';
import { globalResources, RESOURCES } from './constants';
import type {
  MatterBody,
  MatterConstraint,
  MatterWorld,
  SerializableNodeData,
  SerializableConstraintData,
} from './types';

// Manages non-serializable Matter.js physics objects
export class PhysicsManager {
  private bodies = new Map<string, MatterBody>();
  private constraints = new Map<string, MatterConstraint>();

  constructor() {
    console.log('new physics manager');
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
    const world = globalResources.get(RESOURCES.WORLD) as MatterWorld;
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
    const parentBody = this.getBody(constraintData.parentId);
    const childBody = this.getBody(constraintData.childId);

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

  getConstraint(constraintId: string): MatterConstraint | undefined {
    return this.constraints.get(constraintId);
  }

  // Update constraint properties
  updateConstraint(
    constraintId: string,
    updates: Partial<{ length: number; stiffness: number; damping: number }>
  ): boolean {
    const constraint = this.getConstraint(constraintId);
    if (!constraint) return false;

    if (updates.length !== undefined) constraint.length = updates.length;
    if (updates.stiffness !== undefined) constraint.stiffness = updates.stiffness;
    if (updates.damping !== undefined) constraint.damping = updates.damping;

    return true;
  }

  // Body property updates
  setBodyPosition(nodeId: string, x: number, y: number): boolean {
    const body = this.getBody(nodeId);
    if (!body) return false;

    Body.setPosition(body, { x, y });
    return true;
  }

  setBodyVelocity(nodeId: string, x: number, y: number): boolean {
    const body = this.getBody(nodeId);
    if (!body) return false;

    Body.setVelocity(body, { x, y });
    return true;
  }

  getBodyPosition(nodeId: string): { x: number; y: number } | null {
    const body = this.getBody(nodeId);
    if (!body) return null;

    return { x: body.position.x, y: body.position.y };
  }

  getBodyVelocity(nodeId: string): { x: number; y: number } | null {
    const body = this.getBody(nodeId);
    if (!body) return null;

    return { x: body.velocity.x, y: body.velocity.y };
  }

  // Apply force to body
  applyForce(nodeId: string, force: { x: number; y: number }): boolean {
    const body = this.getBody(nodeId);
    if (!body) return false;

    Body.applyForce(body, body.position, force);
    return true;
  }

  // Batch operations
  addBodiesToWorld(nodeIds: string[]): void {
    const world = globalResources.get(RESOURCES.WORLD) as MatterWorld;
    if (!world) return;

    const bodies = nodeIds.map((id) => this.getBody(id)).filter(Boolean) as MatterBody[];
    if (bodies.length > 0) {
      World.add(world, bodies);
    }
  }

  addConstraintsToWorld(constraintIds: string[]): void {
    const world = globalResources.get(RESOURCES.WORLD) as MatterWorld;
    if (!world) return;

    const constraints = constraintIds
      .map((id) => this.getConstraint(id))
      .filter(Boolean) as MatterConstraint[];
    if (constraints.length > 0) {
      World.add(world, constraints);
    }
  }

  // Extract current physics state for serialization
  extractPhysicsState(): {
    positions: Record<string, { x: number; y: number }>;
    velocities: Record<string, { x: number; y: number }>;
  } {
    const positions: Record<string, { x: number; y: number }> = {};
    const velocities: Record<string, { x: number; y: number }> = {};

    this.bodies.forEach((body, nodeId) => {
      positions[nodeId] = { x: body.position.x, y: body.position.y };
      velocities[nodeId] = { x: body.velocity.x, y: body.velocity.y };
    });

    return { positions, velocities };
  }

  // Apply physics state from serialized data
  applyPhysicsState(
    positions: Record<string, { x: number; y: number }>,
    velocities: Record<string, { x: number; y: number }>
  ): void {
    Object.entries(positions).forEach(([nodeId, pos]) => {
      this.setBodyPosition(nodeId, pos.x, pos.y);
    });

    Object.entries(velocities).forEach(([nodeId, vel]) => {
      this.setBodyVelocity(nodeId, vel.x, vel.y);
    });
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
    console.log(
      `🔄 Scaling ${this.bodies.size} bodies by ${scaleX.toFixed(3)}x${scaleY.toFixed(3)}`
    );
    console.log(`📍 From center (${oldCenterX}, ${oldCenterY}) to (${newCenterX}, ${newCenterY})`);

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

    console.log(`✅ All bodies repositioned`);
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

  // Remove unconstrained bodies
  removeUnconstrainedBodies(rootNodeId: string): string[] {
    const unconstrainedIds = this.findUnconstrainedBodies(rootNodeId);

    unconstrainedIds.forEach((nodeId) => {
      this.removeBody(nodeId);
    });

    return unconstrainedIds;
  }

  // Clear all physics objects
  clear(): void {
    const world = globalResources.get(RESOURCES.WORLD) as MatterWorld;

    if (world) {
      // Remove all bodies and constraints from world
      World.remove(world, [...this.bodies.values(), ...this.constraints.values()]);
    }

    this.bodies.clear();
    this.constraints.clear();
  }

  // Get counts
  get bodyCount(): number {
    return this.bodies.size;
  }

  get constraintCount(): number {
    return this.constraints.size;
  }
}
