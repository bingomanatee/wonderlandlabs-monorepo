// Global resources map and constants
export const globalResources = new Map<string, any>();

export const RESOURCES = {
  ENGINE: 'engine',
  WORLD: 'world',
  RENDER: 'render',
  RUNNER: 'runner',
} as const;

// ---------- Config
export const CFG = {
  nodeRadius: 4, // Small nodes
  twigRadius: 1.5, // Tiny twigs
  leafRadius: 2.5, // Small leaves
  airFriction: 0.25, // Higher air friction for less inertia
  // Spring lengths as percentages of canvas height
  springLengthPercent: 0.025, // 2.5% of canvas height for main springs
  twigSpringLengthPercent: 0.012, // 1.2% of canvas height for twig springs
  leafSpringLengthPercent: 0.015, // 1.5% of canvas height for leaf springs
  // Spring properties (non-length) - higher damping for less inertia
  springStiffness: 0.008, // Much lower stiffness
  springDamping: 0.9, // Higher damping to reduce oscillation
  twigSpringStiffness: 0.002, // Much lower twig stiffness
  twigSpringDamping: 0.95, // Higher twig damping
  leafSpringStiffness: 0.001, // Much lower leaf stiffness
  leafSpringDamping: 0.98, // Very high leaf damping for minimal bounce
  repulsion: { k: 0.1, min: 8, max: 60 }, // Much lower repulsion force
  gravity: 0.0002, // Much lower gravity
  upwardForce: 0.0008, // Increased by 30% for better tree posture
  centerPull: 1e-8, // Much lower center pull
  velocityDamping: 0.92, // Much stronger velocity damping for low inertia
};

export // Constants for tree generation - arrays of possible child counts for each depth
const BRANCH_CHILD_COUNTS = [
  [2, 3, 4], // Depth 0: Trunk top - 2-4 main branches
  [2, 3], // Depth 1: Primary branches - 2-3 children
  [2, 2, 3], // Depth 2: Secondary branches - mostly 2, some 3
  [2, 2, 2, 3], // Depth 3: Tertiary branches - mostly 2, few 3
  [1, 2], // Depth 4: Small branches - 1-2 children
  [1, 2], // Depth 5: Twigs - 1-2 children
  [0], // Depth 6+: No children (terminal)
];
