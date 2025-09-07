// Global resources map and constants
export const globalResources = new Map<string, any>();

export const RESOURCES = {
    ENGINE: 'engine',
    WORLD: 'world',
    RENDER: 'render',
    RUNNER: 'runner'
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
    springStiffness: 0.005, // Much lower stiffness
    springDamping: 0.9, // Higher damping to reduce oscillation
    twigSpringStiffness: 0.002, // Much lower twig stiffness
    twigSpringDamping: 0.95, // Higher twig damping
    leafSpringStiffness: 0.001, // Much lower leaf stiffness
    leafSpringDamping: 0.98, // Very high leaf damping for minimal bounce
    repulsion: {k: 0.1, min: 8, max: 60}, // Much lower repulsion force
    gravity: 0.0002, // Much lower gravity
    upwardForce: 0.0013, // Increased by 30% for better tree posture
    centerPull: 1e-8, // Much lower center pull
    velocityDamping: 0.92, // Much stronger velocity damping for low inertia
};
