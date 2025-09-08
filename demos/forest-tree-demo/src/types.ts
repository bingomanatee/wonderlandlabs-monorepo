export interface Point {
  x: number;
  y: number;
}

export interface Leaf {
  id: string;
  position: Point;
  restPosition: Point; // Natural rest position
  size: number;
  color: string;
  opacity: number;
  rotation: number;
  // PhysicsMgr properties
  velocity: Point;
  force: Point;
  area: number; // For wind resistance calculation
}

export interface Branch {
  id: string;
  relativePosition: Point; // Position relative to parent (0,0 = parent's end)
  absolutePosition: Point; // Calculated absolute position for physics/drawing
  thickness: number;
  length: number;
  angle: number; // Angle relative to parent
  children: Branch[];
  leaves: Leaf[];
  generation: number;
  level: number; // Fluid level (can be different from generation)
  color: number; // PIXI color value (e.g., 0x8b4513)
  branchCountOffset: number; // Random offset applied to this branch's count
  ancestralOffsetSum: number; // Sum of all ancestor offsets (for density balancing)
  levelChangeOffset: number; // +1 if level increased, 0 if stayed same
  ancestralLevelSum: number; // Sum of level changes in ancestry
  // PhysicsMgr properties
  velocity: Point; // Current velocity
  force: Point; // Accumulated forces
  springConstant: number; // Spring stiffness
  mass: number; // For force integration
}

export interface TreeState {
  trunk: Branch;
  windForce: Point;
  mousePosition: Point;
  growth: number;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  time: number;
  width: number;
  height: number;
  initialized: boolean;
  terminated: boolean;
  // Force-directed layout parameters
  forceParams: {
    springStrength: number;
    repulsionStrength: number;
    upwardGravity: number;
    damping: number;
    maxDistance: number; // Maximum distance for repulsion forces
    animating: boolean;
    lastSimulationTime: number; // Timestamp of last simulation step
  };
}

export interface TreeConfig {
  maxGenerations: number;
  branchingFactor: number;
  lengthDecay: number;
  angleVariation: number;
  leafDensity: number;
  windStrength: number;
  centerX?: number;
  centerY?: number;
  season?: 'spring' | 'summer' | 'autumn' | 'fall' | 'winter';
}
