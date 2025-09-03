import { Engine, World, Bodies, Body, Constraint, Vector, Force } from 'matter-js';
import type { Branch, Point } from './types';

export class MatterTreePhysics {
  private engine: Engine;
  private world: World;
  private branchBodies: Map<string, Body> = new Map();
  private leafBodies: Map<string, Body> = new Map();
  private constraints: Constraint[] = [];
  private windForce: Point = { x: 0, y: 0 };

  constructor() {
    // Create Matter.js engine
    this.engine = Engine.create();
    this.world = this.engine.world;

    // Configure physics
    this.engine.world.gravity.y = 0; // No gravity for tree simulation
    this.engine.timing.timeScale = 1;
  }

  // Initialize tree physics bodies and constraints
  public initializeTree(trunk: Branch): void {
    this.createBranchBodies(trunk);
    this.createConstraints(trunk);
  }

  // Update physics simulation
  public update(trunk: Branch, windForce: Point): void {
    this.windForce = windForce;

    // Apply wind forces to leaves and branches
    this.applyWindForces(trunk);

    // Update Matter.js engine
    Engine.update(this.engine, 16); // ~60 FPS

    // Sync Matter.js bodies back to tree structure
    this.syncBodiesToTree(trunk);
  }

  private createBranchBodies(branch: Branch): void {
    // Create Matter.js body for branch
    const branchLength = Vector.magnitude(Vector.sub(branch.endPoint, branch.startPoint));
    const branchAngle = Math.atan2(
      branch.endPoint.y - branch.startPoint.y,
      branch.endPoint.x - branch.startPoint.x
    );

    const centerX = (branch.startPoint.x + branch.endPoint.x) / 2;
    const centerY = (branch.startPoint.y + branch.endPoint.y) / 2;

    const body = Bodies.rectangle(centerX, centerY, branchLength, branch.thickness, {
      angle: branchAngle,
      density: branch.mass / (branchLength * branch.thickness), // Convert mass to density
      frictionAir: 0.02, // Air resistance
      inertia: Infinity, // Prevent rotation for now
    });

    this.branchBodies.set(branch.id, body);
    World.add(this.world, body);

    // Don't create physics bodies for leaves - they're just visual
    // Leaves will contribute wind resistance to their parent branch

    // Recursively create bodies for child branches
    branch.children.forEach((child) => this.createBranchBodies(child));
  }

  private createConstraints(branch: Branch): void {
    const branchBody = this.branchBodies.get(branch.id);
    if (!branchBody) return;

    // Leaves don't need constraints - they're just visual elements

    // Connect child branches to parent with spring constraints
    branch.children.forEach((child) => {
      const childBody = this.branchBodies.get(child.id);
      if (!childBody) return;

      const constraint = Constraint.create({
        bodyA: branchBody,
        bodyB: childBody,
        stiffness: 0.6, // Slightly more flexible connection
        damping: 0.05,
        length: 0, // Connected directly
      });

      this.constraints.push(constraint);
      World.add(this.world, constraint);

      // Recursively create constraints for child branches
      this.createConstraints(child);
    });
  }

  private applyWindForces(branch: Branch): void {
    // Apply wind to branch body
    const branchBody = this.branchBodies.get(branch.id);
    if (branchBody) {
      // Base wind force on branch
      const baseWindScale = 0.001;

      // Add wind resistance from leaves (more leaves = more wind force)
      const leafWindContribution = branch.leaves.length * 0.0005;

      // Reduce bend resistance based on generation (higher generation = more flexible)
      const bendResistance = Math.max(0.1, 1 - branch.generation * 0.2);

      // Total wind force = base + leaf contribution, reduced by bend resistance
      const totalWindScale = (baseWindScale + leafWindContribution) / bendResistance;

      Force.apply(branchBody, branchBody.position, {
        x: this.windForce.x * totalWindScale,
        y: this.windForce.y * totalWindScale,
      });
    }

    // Recursively apply to child branches
    branch.children.forEach((child) => this.applyWindForces(child));
  }

  private syncBodiesToTree(branch: Branch): void {
    // Sync branch body position back to tree structure
    const branchBody = this.branchBodies.get(branch.id);
    if (branchBody) {
      // Update branch endpoints based on body position and angle
      const halfLength = branch.length / 2;
      const cos = Math.cos(branchBody.angle);
      const sin = Math.sin(branchBody.angle);

      branch.startPoint.x = branchBody.position.x - halfLength * cos;
      branch.startPoint.y = branchBody.position.y - halfLength * sin;
      branch.endPoint.x = branchBody.position.x + halfLength * cos;
      branch.endPoint.y = branchBody.position.y + halfLength * sin;
    }

    // Leaves are just visual - no syncing needed

    // Recursively sync child branches
    branch.children.forEach((child) => this.syncBodiesToTree(child));
  }
}
