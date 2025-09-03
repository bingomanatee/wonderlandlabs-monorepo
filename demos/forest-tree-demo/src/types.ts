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
  // Physics properties
  velocity: Point;
  force: Point;
  area: number; // For wind resistance calculation
}

export interface Branch {
  id: string;
  startPoint: Point;
  endPoint: Point;
  restStartPoint: Point; // Natural rest position
  restEndPoint: Point; // Natural rest position
  thickness: number;
  angle: number;
  length: number;
  children: Branch[];
  leaves: Leaf[];
  generation: number;
  // Physics properties
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
}
