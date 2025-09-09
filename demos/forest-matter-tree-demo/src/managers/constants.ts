export const globalResources = new Map<string, any>();

export const RESOURCES = {
  ENGINE: 'engine',
  WORLD: 'world',
  RENDER: 'render',
  RUNNER: 'runner',
  NODES: 'nodes',
  CONSTRAINTS: 'constraints',
  BODIES: 'bodies',
  UTILS: 'utils,',
} as const;

export const CFG = {
  nodeRadius: 4,
  twigRadius: 1.5,
  leafRadius: 2.5,
  airFriction: 0.25,
  springLengthPercent: 0.025,
  twigSpringLengthPercent: 0.012,
  leafSpringLengthPercent: 0.015,
  springStiffness: 0.012,
  springDamping: 0.9,
  twigSpringStiffness: 0.002,
  twigSpringDamping: 0.95,
  leafSpringStiffness: 0.005,
  leafSpringDamping: 0.98,
  repulsion: { k: 0.1, min: 8, max: 60 },
  gravity: 0.0002,
  upwardForce: 0.00125,
  centerPull: 1e-8,
  velocityDamping: 0.92,
};

export const BRANCH_CHILD_COUNTS = [
  [2, 2, 2, 3],
  [2, 2, 2, 2, 3, 3],
  [2, 2, 3],
  [1, 2, 2, 2, 3],
  [1, 2],
  [1, 2],
  [0],
];
