import { Engine, World, Bodies, Body, Constraint, Vector, Force } from 'matter-js';
import { Branch, Leaf, Point } from './types';

export class TreePhysics {
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
  public updatePhysics(trunk: Branch, windForce: Point): void {
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

    // Create bodies for leaves
    branch.leaves.forEach((leaf) => {
      const leafBody = Bodies.circle(leaf.position.x, leaf.position.y, leaf.size, {
        density: 0.001, // Very light leaves
        frictionAir: 0.05, // High air resistance for leaves
      });

      this.leafBodies.set(leaf.id, leafBody);
      World.add(this.world, leafBody);
    });

    // Recursively create bodies for child branches
    branch.children.forEach((child) => this.createBranchBodies(child));
  }

  private applyWindToLeaves(branch: Branch, windForce: Point): void {
    // Apply wind force to leaves based on their area
    branch.leaves.forEach((leaf) => {
      const windOnLeaf = {
        x: windForce.x * leaf.area * this.windResistance,
        y: windForce.y * leaf.area * this.windResistance,
      };

      // Add wind force to leaf
      leaf.force.x += windOnLeaf.x;
      leaf.force.y += windOnLeaf.y;

      // Transfer leaf force to parent branch (at end point)
      branch.force.x += windOnLeaf.x * 0.5; // Partial transfer
      branch.force.y += windOnLeaf.y * 0.5;
    });

    // Recursively apply to child branches
    branch.children.forEach((child) => this.applyWindToLeaves(child, windForce));
  }

  private applySpringForces(branch: Branch): void {
    // Spring force to restore branch to rest position
    const startDisplacement = {
      x: branch.startPoint.x - branch.restStartPoint.x,
      y: branch.startPoint.y - branch.restStartPoint.y,
    };

    const endDisplacement = {
      x: branch.endPoint.x - branch.restEndPoint.x,
      y: branch.endPoint.y - branch.restEndPoint.y,
    };

    // Apply exponential spring force (F = -k * x^2 for stronger restoring)
    const springForceStart = {
      x: -branch.springConstant * startDisplacement.x * Math.abs(startDisplacement.x),
      y: -branch.springConstant * startDisplacement.y * Math.abs(startDisplacement.y),
    };

    const springForceEnd = {
      x: -branch.springConstant * endDisplacement.x * Math.abs(endDisplacement.x),
      y: -branch.springConstant * endDisplacement.y * Math.abs(endDisplacement.y),
    };

    // Apply forces (end point gets more force as it's more flexible)
    branch.force.x += springForceStart.x * 0.3 + springForceEnd.x * 0.7;
    branch.force.y += springForceStart.y * 0.3 + springForceEnd.y * 0.7;

    // Apply spring forces to leaves
    branch.leaves.forEach((leaf) => {
      const leafDisplacement = {
        x: leaf.position.x - leaf.restPosition.x,
        y: leaf.position.y - leaf.restPosition.y,
      };

      leaf.force.x += -0.5 * leafDisplacement.x * Math.abs(leafDisplacement.x);
      leaf.force.y += -0.5 * leafDisplacement.y * Math.abs(leafDisplacement.y);
    });

    // Recursively apply to child branches
    branch.children.forEach((child) => this.applySpringForces(child));
  }

  private applyChildPullForces(branch: Branch): void {
    // Each child branch pulls on its parent based on its displacement
    branch.children.forEach((child) => {
      // Calculate child's net displacement from rest position
      const childDisplacement = {
        x: child.endPoint.x - child.restEndPoint.x,
        y: child.endPoint.y - child.restEndPoint.y,
      };

      // Child pulls parent with reduced force (based on child's mass and displacement)
      const pullStrength = 0.3; // Reduction factor for child influence
      const childPullForce = {
        x: childDisplacement.x * child.mass * pullStrength,
        y: childDisplacement.y * child.mass * pullStrength,
      };

      // Apply pull force to parent's end point (where child connects)
      branch.force.x += childPullForce.x;
      branch.force.y += childPullForce.y;

      // Recursively apply child pull forces
      this.applyChildPullForces(child);
    });
  }

  private applyRepulsionForces(branch: Branch): void {
    // Get all branch endpoints for repulsion calculation
    const allNodes = this.getAllNodes(branch);

    allNodes.forEach((nodeA, indexA) => {
      allNodes.forEach((nodeB, indexB) => {
        if (indexA >= indexB) return; // Avoid duplicate calculations

        const distance = Math.sqrt(
          Math.pow(nodeA.point.x - nodeB.point.x, 2) + Math.pow(nodeA.point.y - nodeB.point.y, 2)
        );

        if (distance < this.repulsionRange && distance > 0) {
          // Repulsion force with drastic falloff (1/distance^3)
          const repulsionMagnitude = this.repulsionStrength / Math.pow(distance, 3);

          const direction = {
            x: (nodeA.point.x - nodeB.point.x) / distance,
            y: (nodeA.point.y - nodeB.point.y) / distance,
          };

          const repulsionForce = {
            x: direction.x * repulsionMagnitude,
            y: direction.y * repulsionMagnitude,
          };

          // Apply equal and opposite forces
          nodeA.branch.force.x += repulsionForce.x;
          nodeA.branch.force.y += repulsionForce.y;
          nodeB.branch.force.x -= repulsionForce.x;
          nodeB.branch.force.y -= repulsionForce.y;
        }
      });
    });
  }

  private getAllNodes(branch: Branch): Array<{ point: Point; branch: Branch }> {
    const nodes = [
      { point: branch.endPoint, branch }, // Only end points for simplicity
    ];

    branch.children.forEach((child) => {
      nodes.push(...this.getAllNodes(child));
    });

    return nodes;
  }

  private integratePhysics(branch: Branch): void {
    // Integrate forces for branch
    // F = ma, so a = F/m
    const acceleration = {
      x: branch.force.x / branch.mass,
      y: branch.force.y / branch.mass,
    };

    // Update velocity: v = v + a*dt
    branch.velocity.x += acceleration.x * this.deltaTime;
    branch.velocity.y += acceleration.y * this.deltaTime;

    // Apply damping
    branch.velocity.x *= this.damping;
    branch.velocity.y *= this.damping;

    // Update position: p = p + v*dt
    branch.endPoint.x += branch.velocity.x * this.deltaTime;
    branch.endPoint.y += branch.velocity.y * this.deltaTime;

    // Integrate leaf physics
    branch.leaves.forEach((leaf) => {
      const leafAcceleration = {
        x: leaf.force.x / 0.1, // Small leaf mass
        y: leaf.force.y / 0.1,
      };

      leaf.velocity.x += leafAcceleration.x * this.deltaTime;
      leaf.velocity.y += leafAcceleration.y * this.deltaTime;
      leaf.velocity.x *= this.damping;
      leaf.velocity.y *= this.damping;

      leaf.position.x += leaf.velocity.x * this.deltaTime;
      leaf.position.y += leaf.velocity.y * this.deltaTime;
    });

    // Recursively integrate child branches
    branch.children.forEach((child) => this.integratePhysics(child));
  }
}
