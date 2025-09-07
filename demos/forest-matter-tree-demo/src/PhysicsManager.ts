import { Bodies, Body, Constraint, World } from 'matter-js';
import { globalResources, RESOURCES } from './constants';
import { forestryTreeData } from './ForestryTreeData';
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

    // Store in ForestryTreeData instead of local Map
    const bodies = forestryTreeData.res.get('matterBodies') as Map<string, any>;
    bodies.set(nodeData.id, body);
    return body;
  }

  getBody(nodeId: string): MatterBody | undefined {
    // Get from ForestryTreeData instead of local Map
    const bodies = forestryTreeData.res.get('matterBodies') as Map<string, any>;
    return bodies?.get(nodeId);
  }

  addBody(nodeId: string, body: MatterBody): void {
    this.bodies.set(nodeId, body);
  }

  removeBody(nodeId: string): boolean {
    // Get from ForestryTreeData instead of local Map
    const bodies = forestryTreeData.res.get('matterBodies') as Map<string, any>;
    const body = bodies?.get(nodeId);
    if (!body) return false;

    // Remove from physics world
    const world = globalResources.get(RESOURCES.WORLD) as MatterWorld;
    if (world) {
      World.remove(world, body);
    }

    // Remove from ForestryTreeData tracking
    bodies.delete(nodeId);
    return true;
  }

  getAllBodies(): MatterBody[] {
    // Get from ForestryTreeData instead of local Map
    const bodies = forestryTreeData.res.get('matterBodies') as Map<string, any>;
    return bodies ? Array.from(bodies.values()) : [];
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

    // Store in ForestryTreeData instead of local Map
    const constraints = forestryTreeData.res.get('matterConstraints') as Map<string, any>;
    constraints.set(constraintData.id, constraint);
    return constraint;
  }

  getConstraint(constraintId: string): MatterConstraint | undefined {
    // Get from ForestryTreeData instead of local Map
    const constraints = forestryTreeData.res.get('matterConstraints') as Map<string, any>;
    return constraints?.get(constraintId);
  }

  removeConstraint(constraintId: string): boolean {
    const constraint = this.constraints.get(constraintId);
    if (!constraint) return false;

    // Remove from physics world
    const world = globalResources.get(RESOURCES.WORLD) as MatterWorld;
    if (world) {
      World.remove(world, constraint);
    }

    // Remove from our tracking
    this.constraints.delete(constraintId);
    return true;
  }

  getAllConstraints(): MatterConstraint[] {
    // Get from ForestryTreeData instead of local Map
    const constraints = forestryTreeData.res.get('matterConstraints') as Map<string, any>;
    return constraints ? Array.from(constraints.values()) : [];
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
      // Get from ForestryTreeData and remove from world
      const bodies = forestryTreeData.res.get('matterBodies') as Map<string, any>;
      const constraints = forestryTreeData.res.get('matterConstraints') as Map<string, any>;
      const allObjects = [
        ...(bodies ? Array.from(bodies.values()) : []),
        ...(constraints ? Array.from(constraints.values()) : [])
      ];
      World.remove(world, allObjects);
    }

    // Clear ForestryTreeData resources
    const bodies = forestryTreeData.res.get('matterBodies') as Map<string, any>;
    const constraints = forestryTreeData.res.get('matterConstraints') as Map<string, any>;
    bodies?.clear();
    constraints?.clear();
  }

  // Get counts
  get bodyCount(): number {
    const bodies = forestryTreeData.res.get('matterBodies') as Map<string, any>;
    return bodies?.size || 0;
  }

  get constraintCount(): number {
    const constraints = forestryTreeData.res.get('matterConstraints') as Map<string, any>;
    return constraints?.size || 0;
  }
}

// Global instance
export const Physics = new PhysicsManager();
