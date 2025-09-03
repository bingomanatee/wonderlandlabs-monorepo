import type { Branch, Leaf, Point, TreeConfig } from './types';

export function generateTree(config: TreeConfig): Branch {
  const centerX = config.centerX ?? 400;
  const centerY = config.centerY ?? 600;
  const trunkLength = 150;

  const trunk: Branch = {
    id: 'trunk',
    startPoint: { x: centerX, y: centerY },
    endPoint: { x: centerX, y: centerY - trunkLength },
    restStartPoint: { x: centerX, y: centerY },
    restEndPoint: { x: centerX, y: centerY - trunkLength },
    thickness: 12,
    angle: -Math.PI / 2, // Pointing up
    length: trunkLength,
    children: [],
    leaves: [],
    generation: 0,
    // Physics properties
    velocity: { x: 0, y: 0 },
    force: { x: 0, y: 0 },
    springConstant: 0.01, // Trunk is stiff
    mass: 100, // Very high trunk mass - maximum resistance
  };

  generateBranches(trunk, config, 0);
  return trunk;
}

function generateBranches(parent: Branch, config: TreeConfig, generation: number) {
  if (generation >= config.maxGenerations) {
    // Terminal branches (leaf branches) - no leaves for now
    if (config.leafDensity > 0) {
      generateLeaves(parent, config);
    }
    return;
  }

  const numBranches = Math.floor(config.branchingFactor + Math.random() * 2);

  for (let i = 0; i < numBranches; i++) {
    const angleOffset = (i - (numBranches - 1) / 2) * config.angleVariation;
    const branchAngle = parent.angle + angleOffset + (Math.random() - 0.5) * 0.3;

    // Curve branches upward
    const upwardBias = -0.2;
    const finalAngle = branchAngle + upwardBias;

    const branchLength = parent.length * config.lengthDecay * (0.8 + Math.random() * 0.4);
    const branchThickness = Math.max(2, parent.thickness * 0.7); // Minimum thickness of 2px

    const endPoint: Point = {
      x: parent.endPoint.x + Math.cos(finalAngle) * branchLength,
      y: parent.endPoint.y + Math.sin(finalAngle) * branchLength,
    };

    const branch: Branch = {
      id: `${parent.id}-${i}`,
      startPoint: { ...parent.endPoint },
      endPoint,
      restStartPoint: { ...parent.endPoint },
      restEndPoint: { ...endPoint },
      thickness: branchThickness,
      angle: finalAngle,
      length: branchLength,
      children: [],
      leaves: [],
      generation: generation + 1,
      // Physics properties - mass halves with each generation
      velocity: { x: 0, y: 0 },
      force: { x: 0, y: 0 },
      springConstant: 0.02,
      mass: parent.mass / 2, // Mass halves: 100 → 50 → 25 → 12.5...
    };

    parent.children.push(branch);
    generateBranches(branch, config, generation + 1);
  }
}

function generateLeaves(branch: Branch, config: TreeConfig) {
  const numLeaves = Math.floor(config.leafDensity * (2 + Math.random() * 3));

  for (let i = 0; i < numLeaves; i++) {
    const t = Math.random(); // Position along branch
    const position: Point = {
      x: branch.startPoint.x + (branch.endPoint.x - branch.startPoint.x) * t,
      y: branch.startPoint.y + (branch.endPoint.y - branch.startPoint.y) * t,
    };

    // Add some random offset
    position.x += (Math.random() - 0.5) * 20;
    position.y += (Math.random() - 0.5) * 20;

    const leafSize = 8 + Math.random() * 6;
    const leaf: Leaf = {
      id: `${branch.id}-leaf-${i}`,
      position,
      restPosition: { ...position },
      size: leafSize,
      color: getLeafColor(),
      opacity: 0.8 + Math.random() * 0.2,
      rotation: Math.random() * 360,
      // Physics properties
      velocity: { x: 0, y: 0 },
      force: { x: 0, y: 0 },
      area: leafSize * leafSize * Math.PI, // Circular area for wind resistance
    };

    branch.leaves.push(leaf);
  }
}

function getLeafColor(): string {
  const colors = [
    '#228B22', // Forest Green
    '#32CD32', // Lime Green
    '#90EE90', // Light Green
    '#9ACD32', // Yellow Green
    '#ADFF2F', // Green Yellow
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export const defaultTreeConfig: TreeConfig = {
  maxGenerations: 6, // 2-6 iterations for simpler visualization
  branchingFactor: 2,
  lengthDecay: 0.75,
  angleVariation: 0.6,
  leafDensity: 0, // No leaves for now
  windStrength: 0.1,
};
