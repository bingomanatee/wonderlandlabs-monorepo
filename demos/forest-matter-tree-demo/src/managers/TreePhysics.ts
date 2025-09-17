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
import type { MatterConstraint, MatterEngine, MatterRender, MatterWorld } from '../types';
import { TreeStoreData } from './forestDataStore';
import type { StoreIF } from '@wonderlandlabs/forestry4';

const wallOpts = { isStatic: true, render: { visible: false } };

export class TreePhysics {
  public rootId?: string;
  public rootPin?: MatterConstraint;
  private lastCanvasSize: { width: number; height: number };
  public store: StoreIF<TreeStoreData>;

  constructor(canvas: HTMLCanvasElement, treeState: StoreIF<TreeStoreData>) {
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

  handleResize(): void {
    const render = this.store.res.get(RESOURCES.RENDER) as MatterRender;
    const canvas = render.canvas;
    const container = canvas.parentElement;

    if (!container) {
      return;
    }

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

    this.store.acts.scaleTree(
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

  // Wind force application
  private windForce = { x: 0, y: 0 };

  applyWind(force: { x: number; y: number }): void {
    this.windForce = { ...force };
  }

  // Update physics simulation
  update(): void {
    const engine = this.store.res.get(RESOURCES.ENGINE) as MatterEngine;
    if (!engine) return;

    // Apply wind forces to all bodies
    /* if (this.windForce.x !== 0 || this.windForce.y !== 0) {
      const list = Array.from(this.store.$res.get(RESOURCES.BODIES).values()) as Body[];
      for (const body of list) {
        Body.applyForce(body, body.position, {
          x: this.windForce.x * body.mass,
          y: this.windForce.y * body.mass
        });
      }
    }*/

    // Update the physics engine
    Engine.update(engine, 16.666); // ~60 FPS
  }

  // Cleanup resources
  cleanup(): void {
    const engine = this.store.res.get(RESOURCES.ENGINE) as MatterEngine;
    const render = this.store.res.get(RESOURCES.RENDER) as MatterRender;

    if (render) {
      Render.stop(render);
    }

    if (engine) {
      Engine.clear(engine);
    }
  }
}
