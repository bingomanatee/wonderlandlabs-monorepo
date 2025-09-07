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
import { CFG, globalResources, RESOURCES } from './constants';
import { treeController } from './TreeController';
import { Physics } from './PhysicsManager';
import { forestryTreeData } from './ForestryTreeData';
import type {
  MatterBody,
  MatterConstraint,
  MatterEngine,
  MatterRender,
  MatterWorld,
  SpringSettings,
  SerializableNodeData,
} from './types';

// Simple UUID generator
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export class TreePhysics {
  public rootId?: string;
  public rootPin?: MatterConstraint;
  public nodes: SerializableNodeData[] = [];
  public nodeBodies: MatterBody[] = [];
  private lastCanvasSize: { width: number; height: number };

  constructor(canvas: HTMLCanvasElement) {
    // Initialize or get global resources
    if (!globalResources.has(RESOURCES.ENGINE)) {
      const engine = Engine.create();
      const world = engine.world;

      globalResources.set(RESOURCES.ENGINE, engine);
      globalResources.set(RESOURCES.WORLD, world);
    }

    // Create render for this canvas (canvas-specific)
    const engine = globalResources.get(RESOURCES.ENGINE) as MatterEngine;
    const world = globalResources.get(RESOURCES.WORLD) as MatterWorld;

    const width = canvas.width;
    const height = canvas.height;

    // Store initial canvas size for resize calculations
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

    globalResources.set(RESOURCES.RENDER, render);

    // Set initial render bounds
    render.bounds.min.x = 0;
    render.bounds.min.y = 0;
    render.bounds.max.x = width;
    render.bounds.max.y = height;

    Render.run(render);

    // Use Matter.js Runner for proper physics timing (only create once)
    if (!globalResources.has(RESOURCES.RUNNER)) {
      const runner = Runner.create();
      globalResources.set(RESOURCES.RUNNER, runner);
      Runner.run(runner, engine);

      // Debug: log that engine is running
      console.log('Physics engine started with Runner');
    }

    // Create world boundaries
    const wallOpts = { isStatic: true, render: { visible: false } };

    // Create collision detector at bottom (below tree line)
    const fallDetector = Bodies.rectangle(
      canvas.width / 2,
      canvas.height + 25, // 25px below canvas bottom
      canvas.width,
      50,
      {
        ...wallOpts,
        isSensor: true, // Sensor doesn't physically block, just detects
        label: 'fall-detector',
        render: { visible: false },
      }
    );

    // Only add the fall detector - no boundary walls to allow natural tree growth
    World.add(world, [fallDetector]);

    // Mouse drag
    const mouse = Mouse.create(canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.2, render: { visible: false } },
    });
    World.add(world, mouseConstraint);
    render.mouse = mouse;

    // per-tick forces
    Events.on(engine, 'beforeUpdate', () => this.applyForces());

    // Collision detection for falling bodies
    Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        const { bodyA, bodyB } = pair;

        // Check if one of the bodies is our fall detector
        if (bodyA.label === 'fall-detector' || bodyB.label === 'fall-detector') {
          const fallingBody = bodyA.label === 'fall-detector' ? bodyB : bodyA;

          if (fallingBody.label && fallingBody.label !== 'fall-detector') {
            console.log(`🍂 FALLING BODY DETECTED: ${fallingBody.label}`);

            // Emit custom event
            const fallEvent = new CustomEvent('bodyFell', {
              detail: {
                bodyLabel: fallingBody.label,
                body: fallingBody,
                position: { x: fallingBody.position.x, y: fallingBody.position.y },
              },
            });
            window.dispatchEvent(fallEvent);

            // Check if it's a tree node
            const treeNode = forestryTreeData.acts.getNode(fallingBody.label);
            if (treeNode) {
              console.log(`🌳 Tree node fell: ${treeNode.nodeType} - ${fallingBody.label}`);
              console.log(`   Parent: ${treeNode.parentId || 'none'}`);
              console.log(`   Constraints: ${treeNode.constraintIds.length}`);
            }
          }
        }
      });
    });

    // Handle canvas resize
    window.addEventListener('resize', () => this.handleResize());
  }

  get center(): { x: number; y: number } {
    const render = globalResources.get(RESOURCES.RENDER) as MatterRender;
    return {
      x: render.canvas.width * 0.5,
      y: render.canvas.height * 0.5,
    };
  }

  // Calculate spring settings based on current canvas size
  getSpringSettings(): {
    spring: SpringSettings;
    twigSpring: SpringSettings;
    leafSpring: SpringSettings;
  } {
    const render = globalResources.get(RESOURCES.RENDER) as MatterRender;
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

  // Update all existing spring lengths based on current canvas size
  updateSpringLengths(): void {
    if (!this.rootId) {
      return;
    }

    const springs = this.getSpringSettings();

    // Update all constraints in the tree
    forestryTreeData.acts.traverse(this.rootId, (node) => {
      node.constraintIds.forEach((constraintId) => {
        const constraint = forestryTreeData.acts.getConstraint(constraintId);
        if (constraint) {
          // Determine constraint type based on node identity
          const isLeafConstraint = node.nodeType === 'leaf' || node.nodeType === 'terminal_leaf';

          if (isLeafConstraint) {
            constraint.length = springs.leafSpring.length;
          } else {
            // For main branches, we need to recalculate based on depth
            // This is a simplified approach - in a full implementation you'd store depth info
            constraint.length = springs.spring.length;
          }
        }
      });
    });

    // Update root pin if it exists
    if (this.rootPin) {
      // Root pin length stays at 0 (fixed position)
      const render = globalResources.get(RESOURCES.RENDER) as MatterRender;
      this.rootPin.pointA.x = this.center.x;
      this.rootPin.pointA.y = render.canvas.height - 100;
    }
  }

  // Handle window resize events
  handleResize(): void {
    console.log('🔄 Window resize detected');
    const render = globalResources.get(RESOURCES.RENDER) as MatterRender;
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

    // Use ForestryTreeData to handle resize
    forestryTreeData.acts.scaleTree(
      this.lastCanvasSize.width,
      this.lastCanvasSize.height,
      newWidth,
      newHeight
    );

    // Reposition the root pin to the new center bottom
    this.repositionRootPin();

    // Update stored canvas size
    this.lastCanvasSize = { width: newWidth, height: newHeight };
  }

  // Create root pin to anchor the tree
  createRootPin(rootId: string): void {
    const rootBody = Physics.getBody(rootId);
    if (!rootBody) {
      console.error('❌ Cannot create root pin: root body not found');
      return;
    }

    const render = globalResources.get(RESOURCES.RENDER) as MatterRender;
    const world = globalResources.get(RESOURCES.WORLD) as MatterWorld;

    this.rootPin = Constraint.create({
      pointA: { x: this.center.x, y: render.canvas.height - 100 }, // Pin near bottom of canvas
      bodyB: rootBody,
      length: 0, // No distance - root is fixed at this point
      stiffness: 1.0, // Maximum stiffness - root cannot move
      damping: 0.9, // High damping to prevent oscillation
      render: { visible: false },
    });

    World.add(world, this.rootPin);
    console.log('📍 Root pin created and anchored');
  }

  // Reposition the root pin when canvas resizes
  repositionRootPin(): void {
    console.log('📍 repositionRootPin called');

    if (!this.rootPin) {
      console.log('❌ No root pin found!');
      return;
    }

    const render = globalResources.get(RESOURCES.RENDER) as MatterRender;
    const newCenter = this.center;
    const oldX = this.rootPin.pointA.x;
    const oldY = this.rootPin.pointA.y;

    // Update the root pin's anchor point to the new center bottom
    this.rootPin.pointA.x = newCenter.x;
    this.rootPin.pointA.y = render.canvas.height - 100;

    console.log(
      `📍 Root pin moved from (${oldX}, ${oldY}) to (${newCenter.x}, ${render.canvas.height - 100})`
    );
    console.log(`📐 Canvas size: ${render.canvas.width} x ${render.canvas.height}`);
  }

  // Reposition all tree nodes proportionally when canvas resizes
  repositionAllNodes(
    oldWidth: number,
    oldHeight: number,
    newWidth: number,
    newHeight: number
  ): void {
    console.log(
      `🔄 Repositioning all nodes from ${oldWidth}x${oldHeight} to ${newWidth}x${newHeight}`
    );

    const scaleX = newWidth / oldWidth;
    const scaleY = newHeight / oldHeight;

    console.log(`📏 Scale factors: X=${scaleX.toFixed(3)}, Y=${scaleY.toFixed(3)}`);

    // Get the old and new center points
    const oldCenterX = oldWidth * 0.5;
    const oldCenterY = oldHeight * 0.5;
    const newCenterX = newWidth * 0.5;
    const newCenterY = newHeight * 0.5;

    let repositionedCount = 0;

    // Reposition all tree nodes
    forestryTreeData.acts.getAllNodes().forEach((node) => {
      const body = Physics.getBody(node.id);
      if (!body) return;
      const oldX = body.position.x;
      const oldY = body.position.y;

      // Calculate relative position from old center
      const relativeX = oldX - oldCenterX;
      const relativeY = oldY - oldCenterY;

      // Scale the relative position and apply to new center
      const newX = newCenterX + relativeX * scaleX;
      const newY = newCenterY + relativeY * scaleY;

      // Update body position
      Body.setPosition(body, { x: newX, y: newY });

      // Reset velocity to prevent jarring movement
      Body.setVelocity(body, { x: 0, y: 0 });

      repositionedCount++;
    });

    console.log(`✅ Repositioned ${repositionedCount} nodes`);
  }

  // Update local arrays from Forestry storage
  updateLocalArrays(): void {
    this.nodes = forestryTreeData.acts.getAllNodes();
    this.nodeBodies = this.nodes.map((node) => Physics.getBody(node.id)).filter(Boolean) as MatterBody[];
  }

  applyForces(): void {
    const list = Physics.getAllBodies();

    // Debug: log occasionally
    if (Math.random() < 0.001) {
      console.log('Applying forces to', list.length, 'bodies');
    }

    // 1) gravity (constant downward force)
    for (const b of list) {
      Body.applyForce(b, b.position, { x: 0, y: CFG.gravity * b.mass });
    }

    // 2) upward force (tree growth force - stronger than gravity)
    for (const b of list) {
      Body.applyForce(b, b.position, { x: 0, y: -CFG.upwardForce * b.mass });
    }

    // 3) repulsion (inverse-square, clamped) - different strengths for different node types
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

        // Use stored repulsion factors for consistent behavior
        const repulsionFactorA = (A as any).repulsionFactor || 1.0;
        const repulsionFactorB = (B as any).repulsionFactor || 1.0;

        // Calculate combined repulsion strength
        // Use the minimum factor so that if one body wants to cluster, it can
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

    // 4) gentle center pull to keep frame
    for (const b of list) {
      Body.applyForce(b, b.position, {
        x: (this.center.x - b.position.x) * CFG.centerPull,
        y: (this.center.y - b.position.y) * CFG.centerPull,
      });
    }

    // 5) velocity damping to reduce excessive jiggle
    for (const b of list) {
      Body.setVelocity(b, {
        x: b.velocity.x * CFG.velocityDamping,
        y: b.velocity.y * CFG.velocityDamping,
      });
    }
  }

  /** Build a tree from adjacency (parent->children) and rootId, with layered initial positions */
  buildTree({ adjacency, rootId }: { adjacency: Map<string, string[]>; rootId: string }): string {
    // group to disable collisions among nodes
    const group = -Math.abs(Bodies.circle(0, 0, 1).collisionFilter.group || Body.nextGroup(true));

    // compute depths for layout
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
      // Distribute nodes across 60% of canvas width, centered
      const render = globalResources.get(RESOURCES.RENDER) as MatterRender;
      const spreadWidth = render.canvas.width * 0.6;
      const nodePosition = ((k + 1) / (slots + 1)) * spreadWidth;
      const x = this.center.x - spreadWidth * 0.5 + nodePosition;
      const y = render.canvas.height - 80 - d * 45; // Start from bottom, grow upward (halved spacing)
      const b = Bodies.circle(x, y, CFG.nodeRadius, {
        frictionAir: CFG.airFriction,
        render: {
          fillStyle: '#DC143C', // Crimson red for branches
          strokeStyle: '#8B0000', // Dark red border
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

      // Create node data (serializable) and store body separately
      const nodeData = {
        id,
        constraintIds: [],
        nodeType: 'branch' as const,
      };
      forestryTreeData.acts.addNode(nodeData);

      // Store the body in PhysicsManager
      Physics.addBody(id, body);

      for (const cid of children) {
        const childId = buildRec(cid);
        const childDepth = depth.get(cid) ?? 0;

        // Calculate spring settings based on depth - higher levels have shorter, stiffer springs
        const depthFactor = childDepth / maxDepth; // 0 to 1, where 1 is deepest
        const springSettings = {
          length: springs.spring.length * (1 - depthFactor * 0.4), // Shorter springs at higher levels
          stiffness: springs.spring.stiffness * (1 + depthFactor * 2), // Stiffer springs at higher levels
          damping: springs.spring.damping * (1 + depthFactor * 0.5), // More damping at higher levels
        };

        const constraintId = forestryTreeData.acts.connectNodes(id, childId, springSettings);
        const world = globalResources.get(RESOURCES.WORLD) as MatterWorld;
        const constraint = forestryTreeData.acts.getConstraint(constraintId);
        if (constraint) {
          World.add(world, constraint);
        }

        // Add leaf/twig nodes between parent and child (skip for root level)
        if (nodeDepth > 0) {
          this.addLeafNodes(id, childId);
        }
      }

      // Add leaves to terminal nodes (end nodes with no children)
      if (children.length === 0 && nodeDepth > 0) {
        this.addTerminalLeaves(id);
      }

      return id;
    };

    const rootNodeId = buildRec(rootId);
    const bodies = [...bodyCache.values()];
    const world = globalResources.get(RESOURCES.WORLD) as MatterWorld;
    const render = globalResources.get(RESOURCES.RENDER) as MatterRender;
    World.add(world, bodies);

    // Pin root firmly at bottom so the tree grows upward like a real tree
    const rootNode = forestryTreeData.acts.getNode(rootNodeId);
    const rootBody = Physics.getBody(rootNodeId);
    if (rootNode && rootBody) {
      this.rootPin = Constraint.create({
        pointA: { x: this.center.x, y: render.canvas.height - 100 }, // Pin near bottom of canvas
        bodyB: rootBody,
        length: 0, // No distance - root is fixed at this point
        stiffness: 1.0, // Maximum stiffness - root cannot move
        damping: 0.9, // High damping to prevent oscillation
        render: { visible: false },
      });
      World.add(world, this.rootPin);
    }

    // store refs
    this.rootId = rootNodeId;

    // Update local arrays from global storage
    this.updateLocalArrays();

    // Add extremely gentle initial random velocities to all bodies
    this.nodeBodies.forEach((body) => {
      Body.setVelocity(body, {
        x: (Math.random() - 0.5) * 0.1,
        y: (Math.random() - 0.5) * 0.1,
      });
    });

    console.log(`Tree created with ${forestryTreeData.acts.getNodeCount()} nodes`);

    // Debug: log positions occasionally to see if bodies are moving
    setInterval(() => {
      const rootBody = Physics.getBody(rootNodeId);
      if (rootBody) {
        console.log(
          'Root body position:',
          rootBody.position.x.toFixed(2),
          rootBody.position.y.toFixed(2)
        );
      }
    }, 2000);

    // Run pruning algorithm to find and fix unconstrained bodies
    this.pruneUnconstrainedBodies();

    // Clean up any unconstrained bodies after tree creation
    this.removeUnconstrainedBodies();

    return rootNodeId;
  }

  // Find and remove bodies that have no constraints (except root which has rootPin)
  removeUnconstrainedBodies(): void {
    console.log('🔍 Checking for unconstrained bodies...');

    const world = globalResources.get(RESOURCES.WORLD) as MatterWorld;
    const bodiesToRemove: MatterBody[] = [];
    const nodeIdsToRemove: string[] = [];

    forestryTreeData.acts.getAllNodes().forEach((node) => {
      // Root node is special - it's constrained by rootPin, not regular constraints
      if (node.id === this.rootId) return;

      // Check if this node has any constraints
      if (node.constraintIds.length === 0) {
        console.log(
          `🚨 Found unconstrained ${node.nodeType}: ${node.id} (parent: ${node.parentId})`
        );
        const body = Physics.getBody(node.id);
        if (body) {
          bodiesToRemove.push(body);
        }
        nodeIdsToRemove.push(node.id);
      }
    });

    if (bodiesToRemove.length > 0) {
      console.log(`🧹 Removing ${bodiesToRemove.length} unconstrained bodies from physics world`);

      // Remove from Matter.js physics world
      World.remove(world, bodiesToRemove);

      // Remove from Forestry data structure
      nodeIdsToRemove.forEach((nodeId) => {
        forestryTreeData.acts.removeNode(nodeId);
        console.log(`   Removed: ${nodeId}`);
      });

      // Update local arrays
      this.updateLocalArrays();

      console.log(`✅ Cleanup complete. Removed ${bodiesToRemove.length} unconstrained bodies`);
    } else {
      console.log('✅ No unconstrained bodies found');
    }
  }

  // Pruning algorithm to find and remove unconstrained bodies
  pruneUnconstrainedBodies(): void {
    console.log('🔍 Starting pruning algorithm...');

    const world = globalResources.get(RESOURCES.WORLD) as MatterWorld;
    const allConstraints = forestryTreeData.acts.getAllConstraints();

    // Get all bodies that are connected by constraints
    const constrainedBodyIds = new Set<string>();

    allConstraints.forEach((constraint) => {
      if (constraint.bodyA && constraint.bodyA.label) {
        constrainedBodyIds.add(constraint.bodyA.label);
      }
      if (constraint.bodyB && constraint.bodyB.label) {
        constrainedBodyIds.add(constraint.bodyB.label);
      }
    });

    // Check all bodies in our tree nodes
    const orphanedBodies: MatterBody[] = [];
    const orphanedNodeIds: string[] = [];

    forestryTreeData.acts.getAllNodes().forEach((node) => {
      if (!constrainedBodyIds.has(node.id) && node.id !== this.rootId) {
        // This body is not connected by any constraint (except root which is pinned)
        const body = Physics.getBody(node.id);
        if (body) {
          orphanedBodies.push(body);
        }
        orphanedNodeIds.push(node.id);
        console.log(`🚨 Found orphaned body: ${node.id} (${node.nodeType})`);
      }
    });

    // Remove orphaned bodies from physics world
    if (orphanedBodies.length > 0) {
      console.log(`🧹 Removing ${orphanedBodies.length} orphaned bodies from physics world`);
      World.remove(world, orphanedBodies);

      // Remove from our data structures too
      orphanedNodeIds.forEach((nodeId) => {
        const node = forestryTreeData.acts.getNode(nodeId);
        if (node) {
          // Clean up any constraints this node owns
          node.constraintIds.forEach((constraintId) => {
            const constraint = forestryTreeData.acts.getConstraint(constraintId);
            if (constraint) {
              World.remove(world, constraint);
            }
          });
        }
      });
    }

    // Also check for bodies in physics world that aren't in our tree
    const physicsBodyLabels = new Set<string>();
    world.bodies.forEach((body) => {
      if (body.label && !body.isStatic) {
        physicsBodyLabels.add(body.label);
      }
    });

    const treeNodeIds = new Set(forestryTreeData.acts.getAllNodes().map((node) => node.id));
    const unknownBodies: MatterBody[] = [];

    world.bodies.forEach((body) => {
      if (body.label && !body.isStatic && !treeNodeIds.has(body.label)) {
        unknownBodies.push(body);
        console.log(`🤔 Found unknown body in physics world: ${body.label}`);
      }
    });

    if (unknownBodies.length > 0) {
      console.log(`🧹 Removing ${unknownBodies.length} unknown bodies from physics world`);
      World.remove(world, unknownBodies);
    }

    console.log(
      `✅ Pruning complete. Removed ${orphanedBodies.length + unknownBodies.length} problematic bodies`
    );

    // Update local arrays after cleanup
    this.updateLocalArrays();
  }

  addLeafNodes(parentNodeId: string, childNodeId: string): void {
    // Create 2-4 small leaf/twig nodes between parent and child
    const numLeaves = 2 + Math.floor(Math.random() * 3); // 2-4 leaves

    const parentNode = forestryTreeData.acts.getNode(parentNodeId);
    const childNode = forestryTreeData.acts.getNode(childNodeId);
    const parentBody = Physics.getBody(parentNodeId);
    const childBody = Physics.getBody(childNodeId);

    if (!parentNode || !childNode || !parentBody || !childBody) {
      return;
    }

    for (let i = 0; i < numLeaves; i++) {
      // Position leaves around the midpoint between parent and child
      const parentPos = parentBody.position;
      const childPos = childBody.position;
      const midX = (parentPos.x + childPos.x) * 0.5;
      const midY = (parentPos.y + childPos.y) * 0.5;

      // Add some random offset for natural spread
      const offsetX = (Math.random() - 0.5) * 60;
      const offsetY = (Math.random() - 0.5) * 40;

      const leafBody = Bodies.circle(midX + offsetX, midY + offsetY, CFG.leafRadius, {
        frictionAir: CFG.airFriction * 1.5, // Leaves have more air resistance
        render: {
          fillStyle: '#32CD32', // Bright lime green for leaves
          strokeStyle: '#006400', // Dark green border
          lineWidth: 2, // Thicker border to make them more visible
        },
        collisionFilter: { group: parentBody.collisionFilter.group },
      });
      const leafId = `leaf_${generateUUID()}`;
      leafBody.label = leafId;

      // Create leaf node data (serializable) and store body separately
      const leafNodeData = {
        id: leafId,
        parentId: parentNodeId, // Set parent directly since we know it exists
        constraintIds: [],
        nodeType: 'leaf' as const,
      };
      forestryTreeData.acts.addNode(leafNodeData);

      // Store the body in PhysicsManager
      Physics.addBody(leafId, leafBody);

      // Connect leaf to parent with flexible spring
      console.log(`🍃 Creating leaf ${leafId} -> parent ${parentNodeId}`);
      const springs = this.getSpringSettings();
      const constraintId = forestryTreeData.acts.connectNodes(parentNodeId, leafId, springs.leafSpring, true);

      const world = globalResources.get(RESOURCES.WORLD) as MatterWorld;
      const constraint = forestryTreeData.acts.getConstraint(constraintId);
      if (constraint) {
        World.add(world, [leafBody, constraint]);
        console.log(`✅ Added leaf ${leafId} with constraint ${constraintId} to physics world`);

        // Verify the leaf node has the constraint in its list
        const leafNode = forestryTreeData.acts.getNode(leafId);
        console.log(`📋 Leaf ${leafId} constraint count: ${leafNode?.constraintIds.length || 0}`);
      } else {
        console.error(`❌ Failed to create constraint for leaf ${leafId}`);
      }
    }
  }

  addTerminalLeaves(terminalNodeId: string): void {
    // Create 3-6 leaves around terminal nodes for a fuller appearance
    const numLeaves = 3 + Math.floor(Math.random() * 4); // 3-6 leaves

    const terminalNode = forestryTreeData.acts.getNode(terminalNodeId);
    const terminalBody = Physics.getBody(terminalNodeId);
    if (!terminalNode || !terminalBody) {
      return;
    }

    for (let i = 0; i < numLeaves; i++) {
      const nodePos = terminalBody.position;

      // Create leaves in a circle around the terminal node
      const angle = (i / numLeaves) * Math.PI * 2;
      const radius = 25 + Math.random() * 20; // 25-45 pixels from center

      const leafX = nodePos.x + Math.cos(angle) * radius;
      const leafY = nodePos.y + Math.sin(angle) * radius;

      const leafBody = Bodies.circle(leafX, leafY, CFG.leafRadius, {
        frictionAir: CFG.airFriction * 1.5, // Leaves have more air resistance
        render: {
          fillStyle: '#90EE90', // Light green for leaves
          strokeStyle: '#228B22',
          lineWidth: 1,
        },
        collisionFilter: { group: terminalBody.collisionFilter.group },
      });
      const leafId = `terminal_leaf_${generateUUID()}`;
      leafBody.label = leafId;

      // Create leaf node data (serializable) and store body separately
      const leafNodeData = {
        id: leafId,
        parentId: terminalNodeId, // Set parent directly since we know it exists
        constraintIds: [],
        nodeType: 'terminal_leaf' as const,
      };
      forestryTreeData.acts.addNode(leafNodeData);

      // Store the body in PhysicsManager
      Physics.addBody(leafId, leafBody);

      // Connect leaf to terminal node with flexible spring
      const springs = this.getSpringSettings();
      const constraintId = forestryTreeData.acts.connectNodes(terminalNodeId, leafId, springs.leafSpring, true);

      const world = globalResources.get(RESOURCES.WORLD) as MatterWorld;
      const constraint = forestryTreeData.acts.getConstraint(constraintId);
      if (constraint) {
        World.add(world, [leafBody, constraint]);
      }
    }
  }
}
