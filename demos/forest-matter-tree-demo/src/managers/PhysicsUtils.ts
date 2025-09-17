import { Bodies, Body, Constraint, World } from 'matter-js';
import { BRANCH_CHILD_COUNTS, CFG, RESOURCES } from './constants';
import {
  MatterBody,
  MatterConstraint,
  MatterWorld,
  NabParams,
  SerializableConstraintData,
  SerializableNodeData,
} from '../types';
import { TreeStoreData } from './forestDataStore';
import type { StoreIF } from '@wonderlandlabs/forestry4';
import { generateUUID } from '../GenerateUUID';
import { shuffle } from 'lodash-es';

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
  createBranches(
    adjacency: Map<string, string[]>,
    parentId: string,
    depth: number,
    nodeCounter: { value: number }
  ) {
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
      this.createBranches(adjacency, childId, depth + 1, nodeCounter);
    }

    if (children.length > 0) {
      adjacency.set(parentId, children);
    }
  }

  createConstraint(
    constraintData: SerializableConstraintData,
    depth: number = 0,
    maxDepth: number = 1
  ): MatterConstraint | null {
    const bodies = this.store.res.get(RESOURCES.BODIES);
    const parentBody = bodies.get(constraintData.parentId);
    const childBody = bodies.get(constraintData.childId);

    if (!parentBody || !childBody) {
      return null;
    }

    // Calculate thickness based on depth - thicker at $root, thinner at leaves
    const depthFactor = maxDepth > 0 ? (maxDepth - depth) / maxDepth : 1;
    const baseThickness = constraintData.isLeaf ? 1 : 8; // Start with thicker base
    const lineWidth = Math.max(1, Math.round(baseThickness * depthFactor));

    const constraint = Constraint.create({
      bodyA: parentBody,
      bodyB: childBody,
      length: constraintData.length,
      stiffness: constraintData.stiffness,
      damping: constraintData.damping,
      render: {
        strokeStyle: constraintData.isLeaf ? '#4a9d4a' : '#6af08e',
        lineWidth: lineWidth,
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
    if (!constraint) {
      return false;
    }

    if (updates.length !== undefined) {
      constraint.length = updates.length;
    }
    if (updates.stiffness !== undefined) {
      constraint.stiffness = updates.stiffness;
    }
    if (updates.damping !== undefined) {
      constraint.damping = updates.damping;
    }

    return true;
  }

  makeDepth(rootId, adjacency) {
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
    return depth;
  }

  createNodeAndBody(id: string, nabParams: NabParams) {
    const { depth, idxByDepth, canvasHeight, canvasWidth, counts, bodyIds } = nabParams;
    const d = depth.get(id) ?? 0;
    const k = idxByDepth.get(d) || 0;
    idxByDepth.set(d, k + 1);
    const slots = counts.get(d);

    // Use scaleBasis for consistent scaling instead of canvasWidth
    const scaleBasis = this.store.value.scaleBasis || canvasWidth; // Fallback to canvasWidth if undefined
    const spreadWidth = scaleBasis * 0.6;
    const nodePosition = ((k + 1) / (slots + 1)) * spreadWidth;
    const x = canvasWidth * 0.5 - spreadWidth * 0.5 + nodePosition;
    const y = canvasHeight - 80 - d * 45;

    const nodeData: SerializableNodeData = {
      id,
      nodeType: '$branch',
      constraintIds: [],
      depth: d,
    };
    this.store.acts.addNode(nodeData);

    const bodyProps = {
      frictionAir: CFG.airFriction,
      inertia: Infinity,
      inverseInertia: 0,
      render: {
        fillStyle: '#DC143C',
        strokeStyle: '#8B0000',
        lineWidth: 2,
      },
      collisionFilter: { group: -1 },
    };

    const body = this.createBody(nodeData, x, y, CFG.nodeRadius, bodyProps);

    (body as any).repulsionFactor = 1.0;

    bodyIds.push(id);
  }

  addLeafNodes(parentNodeId: string, childNodeId: string, canvasHeight: number): void {
    const numLeaves = 2 + Math.floor(Math.random() * 3);
    const springs = this.getSpringSettings(canvasHeight);

    const parentBody = this.store.getRes([RESOURCES.BODIES, parentNodeId]);
    const childBody = this.store.getRes([RESOURCES.BODIES, childNodeId]);
    if (!parentBody || !childBody) {
      return;
    }

    for (let i = 0; i < numLeaves; i++) {
      const parentPos = parentBody.position;
      const childPos = childBody.position;
      const midX = (parentPos.x + childPos.x) * 0.5;
      const midY = (parentPos.y + childPos.y) * 0.5;

      const offsetX = (Math.random() - 0.5) * 60;
      const offsetY = (Math.random() - 0.5) * 40;

      const leafId = `leaf_${generateUUID()}`;

      // Create serializable leaf data
      const parentNode = this.store.acts.getNode(parentNodeId);
      const parentDepth = parentNode?.depth ?? 0;
      const leafData: SerializableNodeData = {
        id: leafId,
        parentId: parentNodeId,
        nodeType: 'leaf',
        constraintIds: [],
        depth: parentDepth + 1,
      };
      this.store.acts.addNode(leafData);

      const leafBody = this.createBody(leafData, midX + offsetX, midY + offsetY, CFG.leafRadius, {
        frictionAir: CFG.airFriction * 1.5,
        inertia: Infinity,
        inverseInertia: 0,
        render: {
          fillStyle: '#32CD32',
          strokeStyle: '#006400',
          lineWidth: 2,
        },
        collisionFilter: { group: -1 },
      });

      if (leafBody) {
        (leafBody as any).repulsionFactor = Math.random() * 0.3;

        // IMPORTANT: Add the leaf node to the physics refs so it can be rendered
        this.store.acts.addNodeRef(leafId, {
          id: leafId,
          nodeType: 'leaf',
          body: leafBody,
          constraintIds: []
        });
      }

      const constraintId = this.store.acts.connectNodes(
        parentNodeId,
        leafId,
        springs.leafSpring,
        true
      );

      const constraintData = this.store.acts.getConstraint(constraintId);
      if (constraintData) {
        const physicsConstraint = this.createConstraint(constraintData, 10, 10); // Leaf constraints
        if (physicsConstraint) {
          this.addConstraintsToWorld([constraintId]);
          this.addBodiesToWorld([leafId]);
        }
      }
    }
  }

  addTerminalLeaves(terminalNodeId: string, canvasHeight: number): void {
    const numLeaves = 3 + Math.floor(Math.random() * 4);
    const springs = this.getSpringSettings(canvasHeight);

    const terminalBody = this.store.getRes([RESOURCES.BODIES, terminalNodeId]);
    if (!terminalBody) {
      return;
    }

    for (let i = 0; i < numLeaves; i++) {
      const nodePos = terminalBody.position;
      const angle = (i / numLeaves) * Math.PI * 2;
      const radius = 25 + Math.random() * 20;

      const leafX = nodePos.x + Math.cos(angle) * radius;
      const leafY = nodePos.y + Math.sin(angle) * radius;

      const leafId = `terminal_leaf_${generateUUID()}`;

      // Create serializable leaf data
      const terminalNode = this.store.acts.getNode(terminalNodeId);
      const terminalDepth = terminalNode?.depth ?? 0;
      const leafData: SerializableNodeData = {
        id: leafId,
        parentId: terminalNodeId,
        nodeType: 'terminal_leaf',
        constraintIds: [],
        depth: terminalDepth + 1,
      };
      this.store.acts.addNode(leafData);

      const terminalLeafBody = this.createBody(leafData, leafX, leafY, CFG.leafRadius, {
        frictionAir: CFG.airFriction * 1.5,
        inertia: Infinity,
        inverseInertia: 0,
        render: {
          fillStyle: '#32CD32',
          strokeStyle: '#006400',
          lineWidth: 2,
        },
        collisionFilter: { group: -1 },
      });

      if (terminalLeafBody) {
        (terminalLeafBody as any).repulsionFactor = Math.random() * 0.4;

        // IMPORTANT: Add the terminal leaf node to the physics refs so it can be rendered
        this.store.acts.addNodeRef(leafId, {
          id: leafId,
          nodeType: 'terminal_leaf',
          body: terminalLeafBody,
          constraintIds: []
        });
      }

      const constraintId = this.store.acts.connectNodes(
        terminalNodeId,
        leafId,
        springs.leafSpring,
        true
      );

      const constraintData = this.store.acts.getConstraint(constraintId);
      if (constraintData) {
        const physicsConstraint = this.createConstraint(constraintData, 10, 10); // Terminal leaf constraints
        if (physicsConstraint) {
          this.addConstraintsToWorld([constraintId]);
          this.addBodiesToWorld([leafId]);
        }
      }
    }
  }

  addBodiesToWorld(nodeIds: string[]): void {
    const world = this.store.res.get(RESOURCES.WORLD) as MatterWorld;
    if (!world) {
      return;
    }

    const bodies = nodeIds
      .map((id) => this.store.res.get(RESOURCES.BODIES).get(id))
      .filter(Boolean) as MatterBody[];
    if (bodies.length > 0) {
      World.add(world, bodies);
    }
  }

  getSpringSettings(canvasHeight: number) {
    // Use scaleBasis for consistent spring lengths instead of canvasHeight
    const scaleBasis = this.store.value.scaleBasis || canvasHeight; // Fallback to canvasHeight if undefined
    return {
      spring: {
        length: scaleBasis * CFG.springLengthPercent,
        stiffness: CFG.springStiffness,
        damping: CFG.springDamping,
      },
      twigSpring: {
        length: scaleBasis * CFG.twigSpringLengthPercent,
        stiffness: CFG.twigSpringStiffness,
        damping: CFG.twigSpringDamping,
      },
      leafSpring: {
        length: scaleBasis * CFG.leafSpringLengthPercent,
        stiffness: CFG.leafSpringStiffness,
        damping: CFG.leafSpringDamping,
      },
    };
  }

  addConstraintsToWorld(constraintIds: string[]): void {
    const world = this.store.res.get(RESOURCES.WORLD) as MatterWorld;
    if (!world) {
      return;
    }

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
