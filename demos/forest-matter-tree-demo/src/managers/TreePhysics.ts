import {
  Bodies,
  Body,
  Constraint,
  Engine,
  Events,
  Mouse,
  MouseConstraint,
  Render,
  Runner,
  World,
} from 'matter-js';
import { CFG, RESOURCES } from './constants';
import type {
  MatterBody,
  MatterConstraint,
  MatterEngine,
  MatterRender,
  MatterWorld,
  SpringSettings,
  TreeNodeData,
} from './types';
import type { TreeController } from './TreeController';
import { TreeStoreData } from './forestDataStore';
import type { StoreIF } from '@wonderlandlabs/forestry4';
import { generateUUID } from '../GenerateUUID';

export class TreePhysics {
  public rootId?: string;
  public rootPin?: MatterConstraint;
  private lastCanvasSize: { width: number; height: number };
  private treeController: TreeController;
  public store: StoreIF<TreeStoreData>;
  constructor(
    canvas: HTMLCanvasElement,
    treeController: TreeController,
    treeState: StoreIF<TreeStoreData>
  ) {
    this.treeController = treeController;
    this.store = treeState;
    if (!this.store.res.has(RESOURCES.ENGINE)) {
      const engine = Engine.create();
      const world = engine.world;

      this.store.res.set(RESOURCES.ENGINE, engine);
      this.store.res.set(RESOURCES.WORLD, world);
    }

    const engine = this.store.res.get(RESOURCES.ENGINE) as MatterEngine;
    const world = this.store.res.get(RESOURCES.WORLD) as MatterWorld;

    const width = canvas.width;
    const height = canvas.height;

    this.lastCanvasSize = { width, height };

    const render = Render.create({
      canvas,
      engine: engine,
      options: {
        wireframes: false,
        background: '#0b1020',
        width: width,
        height: height,
        showVelocity: false,
        showAngleIndicator: false,
        showDebug: false,
      },
    });

    this.store.res.set(RESOURCES.RENDER, render);

    // Set initial render bounds
    render.bounds.min.x = 0;
    render.bounds.min.y = 0;
    render.bounds.max.x = width;
    render.bounds.max.y = height;

    Render.run(render);

    if (!this.store.res.has(RESOURCES.RUNNER)) {
      const runner = Runner.create();
      this.store.res.set(RESOURCES.RUNNER, runner);
      Runner.run(runner, engine);
    }

    const wallOpts = { isStatic: true, render: { visible: false } };

    const fallDetector = Bodies.rectangle(canvas.width / 2, canvas.height + 25, canvas.width, 50, {
      ...wallOpts,
      isSensor: true,
      label: 'fall-detector',
      render: { visible: false },
    });

    World.add(world, [fallDetector]);

    const mouse = Mouse.create(canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.2, render: { visible: false } },
    });
    World.add(world, mouseConstraint);
    render.mouse = mouse;

    Events.on(engine, 'beforeUpdate', () => this.applyForces());

    Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        const { bodyA, bodyB } = pair;

        if (bodyA.label === 'fall-detector' || bodyB.label === 'fall-detector') {
          const fallingBody = bodyA.label === 'fall-detector' ? bodyB : bodyA;

          if (fallingBody.label && fallingBody.label !== 'fall-detector') {
            const fallEvent = new CustomEvent('bodyFell', {
              detail: {
                bodyLabel: fallingBody.label,
                body: fallingBody,
                position: { x: fallingBody.position.x, y: fallingBody.position.y },
              },
            });
            window.dispatchEvent(fallEvent);

            const treeNode = this.store.acts.getNodeRef(fallingBody.label);
          }
        }
      });
    });

    window.addEventListener('resize', () => this.handleResize());
  }

  get center(): { x: number; y: number } {
    const render = this.store.res.get(RESOURCES.RENDER) as MatterRender;
    return {
      x: render.canvas.width * 0.5,
      y: render.canvas.height * 0.5,
    };
  }

  getSpringSettings(): {
    spring: SpringSettings;
    twigSpring: SpringSettings;
    leafSpring: SpringSettings;
  } {
    const render = this.store.res.get(RESOURCES.RENDER) as MatterRender;
    const canvasHeight = render.canvas.height;
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

  handleResize(): void {
    const render = this.store.res.get(RESOURCES.RENDER) as MatterRender;
    const canvas = render.canvas;
    const container = canvas.parentElement;

    if (!container) return;

    const containerStyle = getComputedStyle(container);
    const paddingLeft = parseFloat(containerStyle.paddingLeft);
    const paddingRight = parseFloat(containerStyle.paddingRight);
    const paddingTop = parseFloat(containerStyle.paddingTop);
    const paddingBottom = parseFloat(containerStyle.paddingBottom);

    const newWidth = container.clientWidth - paddingLeft - paddingRight;
    const newHeight = container.clientHeight - paddingTop - paddingBottom;

    // Update canvas dimensions
    canvas.width = newWidth;
    canvas.height = newHeight;
    canvas.style.width = newWidth + 'px';
    canvas.style.height = newHeight + 'px';

    // Update render options
    render.options.width = newWidth;
    render.options.height = newHeight;
    render.bounds.min.x = 0;
    render.bounds.min.y = 0;
    render.bounds.max.x = newWidth;
    render.bounds.max.y = newHeight;

    this.treeController.scaleTree(
      this.lastCanvasSize.width,
      this.lastCanvasSize.height,
      newWidth,
      newHeight
    );

    this.repositionRootPin();

    this.lastCanvasSize = { width: newWidth, height: newHeight };
  }

  createRootPin(rootId: string): void {
    const rootBody = this.store.getRes([RESOURCES.BODIES, rootId]);
    if (!rootBody) {
      return;
    }

    const render = this.store.res.get(RESOURCES.RENDER) as MatterRender;
    const world = this.store.res.get(RESOURCES.WORLD) as MatterWorld;

    this.rootPin = Constraint.create({
      pointA: { x: this.center.x, y: render.canvas.height - 100 },
      bodyB: rootBody,
      length: 0,
      stiffness: 1.0,
      damping: 0.9,
      render: { visible: false },
    });

    World.add(world, this.rootPin);
  }

  repositionRootPin(): void {
    const render = this.store.res.get(RESOURCES.RENDER) as MatterRender;
    const newCenter = this.center;
    const oldX = this.rootPin.pointA.x;
    const oldY = this.rootPin.pointA.y;

    this.rootPin.pointA.x = newCenter.x;
    this.rootPin.pointA.y = render.canvas.height - 100;
  }

  applyForces(): void {
    const list = Array.from(this.store.res.get(RESOURCES.BODIES).values()) as Body[];

    for (const b of list) {
      Body.applyForce(b, b.position, { x: 0, y: CFG.gravity * b.mass });
      Body.applyForce(b, b.position, { x: 0, y: -CFG.upwardForce * b.mass });
    }

    const { k, min, max } = CFG.repulsion;
    for (let i = 0; i < list.length; i++) {
      const A = list[i];
      for (let j = i + 1; j < list.length; j++) {
        const B = list[j];
        const dx = B.position.x - A.position.x;
        const dy = B.position.y - A.position.y;
        const r2 = dx * dx + dy * dy;
        if (r2 === 0) {
          continue;
        }
        const r = Math.sqrt(r2);
        if (r > max) {
          continue;
        }

        const repulsionFactorA = (A as any).repulsionFactor || 1.0;
        const repulsionFactorB = (B as any).repulsionFactor || 1.0;

        const combinedRepulsionFactor = Math.min(repulsionFactorA, repulsionFactorB);
        const repulsionStrength = k * combinedRepulsionFactor;

        const clamped = Math.max(r, min);
        const mag = repulsionStrength / (clamped * clamped);
        const fx = (dx / r) * mag;
        const fy = (dy / r) * mag;
        Body.applyForce(A, A.position, { x: -fx, y: -fy });
        Body.applyForce(B, B.position, { x: fx, y: fy });
      }
    }

    for (const b of list) {
      Body.applyForce(b, b.position, {
        x: (this.center.x - b.position.x) * CFG.centerPull,
        y: (this.center.y - b.position.y) * CFG.centerPull,
      });
    }

    for (const b of list) {
      Body.setVelocity(b, {
        x: b.velocity.x * CFG.velocityDamping,
        y: b.velocity.y * CFG.velocityDamping,
      });
    }
  }

  buildTree({ adjacency, rootId }: { adjacency: Map<string, string[]>; rootId: string }): string {
    const group = -Math.abs(Bodies.circle(0, 0, 1).collisionFilter.group || Body.nextGroup(true));

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

    const makeBody = (id: string): MatterBody => {
      const d = depth.get(id) ?? 0;
      const k = idxByDepth.get(d) || 0;
      idxByDepth.set(d, k + 1);
      const slots = counts.get(d);
      const render = this.store.res.get(RESOURCES.RENDER) as MatterRender;
      const spreadWidth = render.canvas.width * 0.6;
      const nodePosition = ((k + 1) / (slots + 1)) * spreadWidth;
      const x = this.center.x - spreadWidth * 0.5 + nodePosition;
      const y = render.canvas.height - 80 - d * 45;
      const b = Bodies.circle(x, y, CFG.nodeRadius, {
        frictionAir: CFG.airFriction,
        render: {
          fillStyle: '#DC143C',
          strokeStyle: '#8B0000',
          lineWidth: 2,
        },
        collisionFilter: { group },
      });
      b.label = id;
      return b;
    };

    const bodyCache = new Map();
    const getBody = (id: string): MatterBody =>
      bodyCache.get(id) || (bodyCache.set(id, makeBody(id)), bodyCache.get(id)!);

    const buildRec = (id: string): string => {
      const body = getBody(id);
      const children = adjacency.get(id) || [];
      const nodeDepth = depth.get(id) ?? 0;
      const springs = this.getSpringSettings();

      const nodeData: TreeNodeData = {
        id,
        body,
        constraintIds: [],
        nodeType: 'branch',
      };
      this.store.acts.addNodeRef(nodeData);

      for (const cid of children) {
        const childId = buildRec(cid);
        const childDepth = depth.get(cid) ?? 0;

        const depthFactor = childDepth / maxDepth;
        const springSettings = {
          length: springs.spring.length * (1 - depthFactor * 0.4),
          stiffness: springs.spring.stiffness * (1 + depthFactor * 2),
          damping: springs.spring.damping * (1 + depthFactor * 0.5),
        };

        const constraintId = this.store.acts.connectNodeRefs(id, childId, springSettings);
        const world = this.store.res.get(RESOURCES.WORLD) as MatterWorld;
        const constraint = this.store.acts.getConstraintRef(constraintId);
        if (constraint) {
          World.add(world, constraint);
        }

        if (nodeDepth > 0) {
          this.addLeafNodes(id, childId);
        }
      }

      if (children.length === 0 && nodeDepth > 0) {
        this.addTerminalLeaves(id);
      }

      return id;
    };

    const rootNodeId = buildRec(rootId);
    const bodies = [...bodyCache.values()];
    const world = this.store.res.get(RESOURCES.WORLD) as MatterWorld;
    const render = this.store.res.get(RESOURCES.RENDER) as MatterRender;
    World.add(world, bodies);

    const rootNode = this.store.acts.getNodeRef(rootNodeId);
    if (rootNode) {
      this.rootPin = Constraint.create({
        pointA: { x: this.center.x, y: render.canvas.height - 100 },
        bodyB: rootNode.body,
        length: 0,
        stiffness: 1.0,
        damping: 0.9,
        render: { visible: false },
      });
      World.add(world, this.rootPin);
    }

    this.rootId = rootNodeId;

    this.store.acts
      .getAllNodeRefs()
      .map((node) => node.body)
      .forEach((body) => {
        Body.setVelocity(body, {
          x: (Math.random() - 0.5) * 0.1,
          y: (Math.random() - 0.5) * 0.1,
        });
      });

    this.pruneUnconstrainedBodies();

    this.removeUnconstrainedBodies();

    return rootNodeId;
  }

  removeUnconstrainedBodies(): void {
    const world = this.store.res.get(RESOURCES.WORLD) as MatterWorld;
    const bodiesToRemove: MatterBody[] = [];
    const nodeIdsToRemove: string[] = [];

    this.store.acts.getAllNodeRefs().forEach((node) => {
      if (node.id === this.rootId) return;

      if (node.constraintIds.length === 0) {
        bodiesToRemove.push(node.body);
        nodeIdsToRemove.push(node.id);
      }
    });

    if (bodiesToRemove.length > 0) {
      World.remove(world, bodiesToRemove);

      nodeIdsToRemove.forEach((nodeId) => {
        this.store.acts.removeNodeRef(nodeId);
      });
    }
  }

  pruneUnconstrainedBodies(): void {
    const world = this.store.res.get(RESOURCES.WORLD) as MatterWorld;
    const allConstraints = this.store.acts.getAllConstraintRefs();

    const constrainedBodyIds = new Set<string>();

    allConstraints.forEach((constraint) => {
      if (constraint.bodyA && constraint.bodyA.label) {
        constrainedBodyIds.add(constraint.bodyA.label);
      }
      if (constraint.bodyB && constraint.bodyB.label) {
        constrainedBodyIds.add(constraint.bodyB.label);
      }
    });

    const orphanedBodies: MatterBody[] = [];
    const orphanedNodeIds: string[] = [];

    this.store.acts.getAllNodeRefs().forEach((node) => {
      if (!constrainedBodyIds.has(node.id) && node.id !== this.rootId) {
        orphanedBodies.push(node.body);
        orphanedNodeIds.push(node.id);
      }
    });

    if (orphanedBodies.length > 0) {
      World.remove(world, orphanedBodies);

      orphanedNodeIds.forEach((nodeId) => {
        const node = this.store.acts.getNodeRef(nodeId);
        if (node) {
          node.constraintIds.forEach((constraintId) => {
            const constraint = this.store.acts.getConstraintRef(constraintId);
            if (constraint) {
              World.remove(world, constraint);
            }
          });
          this.store.acts.removeNodeRef(nodeId);
        }
      });
    }

    const physicsBodyLabels = new Set<string>();
    world.bodies.forEach((body) => {
      if (body.label && !body.isStatic) {
        physicsBodyLabels.add(body.label);
      }
    });

    const treeNodeIds = new Set(this.store.acts.getAllNodeRefs().map((node) => node.id));
    const unknownBodies: MatterBody[] = [];

    world.bodies.forEach((body) => {
      if (body.label && !body.isStatic && !treeNodeIds.has(body.label)) {
        unknownBodies.push(body);
      }
    });

    if (unknownBodies.length > 0) {
      World.remove(world, unknownBodies);
    }
  }

  addLeafNodes(parentNodeId: string, childNodeId: string): void {
    const numLeaves = 2 + Math.floor(Math.random() * 3);

    const parentNode = this.store.acts.getNodeRef(parentNodeId);
    const childNode = this.store.acts.getNodeRef(childNodeId);
    if (!parentNode || !childNode) {
      return;
    }

    for (let i = 0; i < numLeaves; i++) {
      const parentPos = parentNode.body.position;
      const childPos = childNode.body.position;
      const midX = (parentPos.x + childPos.x) * 0.5;
      const midY = (parentPos.y + childPos.y) * 0.5;

      const offsetX = (Math.random() - 0.5) * 60;
      const offsetY = (Math.random() - 0.5) * 40;

      const leafBody = Bodies.circle(midX + offsetX, midY + offsetY, CFG.leafRadius, {
        frictionAir: CFG.airFriction * 1.5,
        render: {
          fillStyle: '#32CD32',
          strokeStyle: '#006400',
          lineWidth: 2,
        },
        collisionFilter: { group: parentNode.body.collisionFilter.group },
      });
      const leafId = `leaf_${generateUUID()}`;
      leafBody.label = leafId;

      const leafNodeData: TreeNodeData = {
        id: leafId,
        parentId: parentNodeId,
        body: leafBody,
        constraintIds: [],
        nodeType: 'leaf',
      };
      this.store.acts.addNodeRef(leafNodeData);

      const springs = this.getSpringSettings();
      const constraintId = this.store.acts.connectNodeRefs(
        parentNodeId,
        leafId,
        springs.leafSpring,
        true
      );

      const world = this.store.res.get(RESOURCES.WORLD) as MatterWorld;
      const constraint = this.store.acts.getConstraintRef(constraintId);
      if (constraint) {
        World.add(world, [leafBody, constraint]);
      }
    }
  }

  addTerminalLeaves(terminalNodeId: string): void {
    const numLeaves = 3 + Math.floor(Math.random() * 4);

    const terminalNode = this.store.acts.getNodeRef(terminalNodeId);
    if (!terminalNode) {
      return;
    }

    for (let i = 0; i < numLeaves; i++) {
      const nodePos = terminalNode.body.position;

      const angle = (i / numLeaves) * Math.PI * 2;
      const radius = 25 + Math.random() * 20;

      const leafX = nodePos.x + Math.cos(angle) * radius;
      const leafY = nodePos.y + Math.sin(angle) * radius;

      const leafBody = Bodies.circle(leafX, leafY, CFG.leafRadius, {
        frictionAir: CFG.airFriction * 1.5,
        render: {
          fillStyle: '#90EE90',
          strokeStyle: '#228B22',
          lineWidth: 1,
        },
        collisionFilter: { group: terminalNode.body.collisionFilter.group },
      });
      const leafId = `terminal_leaf_${generateUUID()}`;
      leafBody.label = leafId;

      const leafNodeData: TreeNodeData = {
        id: leafId,
        parentId: terminalNodeId,
        body: leafBody,
        constraintIds: [],
        nodeType: 'terminal_leaf',
      };
      this.store.acts.addNodeRef(leafNodeData);

      const springs = this.getSpringSettings();
      const constraintId = this.store.acts.connectNodeRefs(
        terminalNodeId,
        leafId,
        springs.leafSpring,
        true
      );

      const world = this.store.res.get(RESOURCES.WORLD) as MatterWorld;
      const constraint = this.store.acts.getConstraintRef(constraintId);
      if (constraint) {
        World.add(world, [leafBody, constraint]);
      }
    }
  }
}
