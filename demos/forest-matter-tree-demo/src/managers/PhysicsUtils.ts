import { Bodies, Body, Constraint, World } from 'matter-js';
import { CFG, globalResources, RESOURCES } from './constants';
import type {
  MatterBody,
  MatterConstraint,
  MatterWorld,
  SerializableNodeData,
  SerializableConstraintData,
} from './types';
import { TreeStoreData } from './forestDataStore';
import type { StoreIF } from '@wonderlandlabs/forestry4';

export class PhysicsUtils {
  private store: StoreIF<TreeStoreData>;

  get bodies() {
    return this.store.res.get(RESOURCES.BODIES);
  }

  get constraints() {
    return this.store.res.get(RESOURCES.CONSTRAINTS);
  }

  constructor(store: StoreIF<TreeStoreData>) {
    this.store = store;
  }

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

  createConstraint(constraintData: SerializableConstraintData): MatterConstraint | null {
    const bodies = this.store.res.get(RESOURCES.BODIES);
    const parentBody = bodies.get(constraintData.parentId);
    const childBody = bodies.get(constraintData.childId);

    if (!parentBody || !childBody) {
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

  getSpringSettings(canvasHeight: number) {
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

  scaleAllPositions(
    scaleX: number,
    scaleY: number,
    oldCenterX: number,
    oldCenterY: number,
    newCenterX: number,
    newCenterY: number
  ): void {
    this.bodies.forEach((body, nodeId) => {
      const relativeX = body.position.x - oldCenterX;
      const relativeY = body.position.y - oldCenterY;

      const newX = newCenterX + relativeX * scaleX;
      const newY = newCenterY + relativeY * scaleY;

      Body.setPosition(body, { x: newX, y: newY });
      Body.setVelocity(body, { x: 0, y: 0 });
    });
  }

  clear(): void {
    const world = this.store.res.get(RESOURCES.WORLD) as MatterWorld;

    if (world) {
      World.remove(world, [...this.bodies.values(), ...this.constraints.values()]);
    }

    this.bodies.clear();
    this.constraints.clear();
  }
}
