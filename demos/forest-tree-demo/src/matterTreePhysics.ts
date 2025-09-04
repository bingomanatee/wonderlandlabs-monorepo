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
    // Create Matter.js body for branch using absolute position
    const endPoint = branch.absolutePosition;

    // Calculate start point from parent's absolute position or default for trunk
    const startPoint =
      branch.generation === 0
        ? { x: endPoint.x, y: endPoint.y + branch.length } // Trunk base
        : { x: endPoint.x - branch.relativePosition.x, y: endPoint.y - branch.relativePosition.y }; // Parent position

    const branchLength = Vector.magnitude(Vector.sub(endPoint, startPoint));
    const branchAngle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);

    const centerX = (startPoint.x + endPoint.x) / 2;
    const centerY = (startPoint.y + endPoint.y) / 2;

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

      // Distance constraint with ±10% tolerance
      const originalLength = child.length;
      const constraint = Constraint.create({
        bodyA: branchBody,
        bodyB: childBody,
        stiffness: 0.8,
        damping: 0.1,
        length: originalLength,
      });

      this.constraints.push(constraint);
      World.add(this.world, constraint);

      // Angular constraint relative to parent's angle
      const parentAngle = branch.generation === 0 ? -Math.PI / 2 : branch.angle; // Trunk points up, others use their angle

      const childAngle = child.angle;
      const childDx = child.relativePosition.x;
      const childDy = child.relativePosition.y;

      const relativeAngle = childAngle - parentAngle;

      const angleConstraint = Constraint.create({
        bodyA: branchBody,
        bodyB: childBody,
        pointA: { x: 0, y: 0 },
        pointB: {
          x: (-originalLength / 2) * Math.cos(relativeAngle),
          y: (-originalLength / 2) * Math.sin(relativeAngle),
        },
        stiffness: 0.6,
        damping: 0.2,
        length: originalLength * 0.9,
      });

      this.constraints.push(angleConstraint);
      World.add(this.world, angleConstraint);

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
      // Update branch position based on body position and angle
      const halfLength = branch.length / 2;
      const cos = Math.cos(branchBody.angle);
      const sin = Math.sin(branchBody.angle);

      // Update the branch absolute position (end point)
      branch.absolutePosition.x = branchBody.position.x + halfLength * cos;
      branch.absolutePosition.y = branchBody.position.y + halfLength * sin;

      // Note: relativePosition stays the same as it's relative to parent
      // The physics system moves the absolute positions, not the relative structure
    }

    // Leaves are just visual - no syncing needed

    // Recursively sync child branches
    branch.children.forEach((child) => this.syncBodiesToTree(child));
  }
}
