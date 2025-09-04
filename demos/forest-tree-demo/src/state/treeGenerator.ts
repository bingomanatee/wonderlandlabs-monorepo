import type { Branch, Leaf, Point, TreeConfig } from '../types.ts';
import { shuffle } from 'lodash-es';

// Generate color variation from parent color
function generateBranchColor(parentColor: number): number {
  // Extract RGB components
  const r = (parentColor >> 16) & 0xff;
  const g = (parentColor >> 8) & 0xff;
  const b = parentColor & 0xff;

  // Add random variation (-20 to +20 for each component)
  const variation = 20;
  const newR = Math.max(0, Math.min(255, r + (Math.random() - 0.5) * 2 * variation));
  const newG = Math.max(0, Math.min(255, g + (Math.random() - 0.5) * 2 * variation));
  const newB = Math.max(0, Math.min(255, b + (Math.random() - 0.5) * 2 * variation));

  // Combine back to hex color
  return (Math.floor(newR) << 16) | (Math.floor(newG) << 8) | Math.floor(newB);
}

export function generateTree(config: TreeConfig): Branch {
  const centerX = config.centerX ?? 400;
  const centerY = config.centerY ?? 600;
  const trunkLength = 133; // Scaled up 11% from 120 (1/3 of previous increase)

  const trunk: Branch = {
    id: 'trunk',
    relativePosition: { x: 0, y: 0 }, // Trunk is at origin
    absolutePosition: { x: centerX, y: centerY - trunkLength },
    thickness: 18, // Made trunk thicker
    length: trunkLength,
    angle: -Math.PI / 2, // Pointing up
    children: [],
    leaves: [],
    generation: 0,
    level: 0, // Start at level 0
    color: 0x8b4513, // Base brown color
    branchCountOffset: 0, // Trunk has no offset
    ancestralOffsetSum: 0, // No ancestors
    levelChangeOffset: 0, // Trunk has no level change
    ancestralLevelSum: 0, // No ancestors
    // Physics properties
    velocity: { x: 0, y: 0 },
    force: { x: 0, y: 0 },
    springConstant: 0.01, // Trunk is stiff
    mass: 100, // Very high trunk mass - maximum resistance
  };

  generateBranches(trunk, config, 0);

  // Add twigs to leaf branches
  addTwigs(trunk, config);

  // Add leaves to branches near the tips
  addLeaves(trunk, config);

  // Force-directed layout will be applied over time, not immediately
  // The layout will be created and animated in the state management

  return trunk;
}

function addTwigs(branch: Branch, config: TreeConfig) {
  // Add twigs to leaf branches (branches with no children)
  if (!branch.children || branch.children.length === 0) {
    // Only add twigs to branches that are at least generation 2
    if (branch.generation >= 2) {
      const twigCount = Math.floor(Math.random() * 3) + 2; // 2-4 twigs per leaf branch

      for (let i = 0; i < twigCount; i++) {
        const twigAngle = branch.angle + (Math.random() - 0.5) * Math.PI * 0.6; // ±54 degrees from branch
        const twigLength = (8 + Math.random() * 12) * 1.11; // Scaled up 11% (9-22 pixels)

        const twigRelativeX = Math.cos(twigAngle) * twigLength;
        const twigRelativeY = Math.sin(twigAngle) * twigLength;

        const twig: Branch = {
          id: `${branch.id}-twig-${i}`,
          relativePosition: { x: twigRelativeX, y: twigRelativeY },
          absolutePosition: {
            x: branch.absolutePosition.x + twigRelativeX,
            y: branch.absolutePosition.y + twigRelativeY,
          },
          angle: twigAngle,
          thickness: 1, // Very thin twigs
          length: twigLength,
          children: [],
          leaves: [],
          generation: branch.generation + 1,
          level: branch.level,
          color: 0x654321, // Slightly darker brown for twigs
          branchCountOffset: 0,
          ancestralOffsetSum: branch.ancestralOffsetSum,
          levelChangeOffset: 0,
          ancestralLevelSum: branch.ancestralLevelSum,
          velocity: { x: 0, y: 0 },
          force: { x: 0, y: 0 },
          springConstant: 0.001, // Very flexible twigs
          mass: 1, // Very light twigs
        };

        branch.children.push(twig);
      }
    }
  } else {
    // Recursively add twigs to child branches
    branch.children.forEach((child) => addTwigs(child, config));
  }
}

function addLeaves(branch: Branch, config: TreeConfig) {
  // Calculate distance to nearest leaf (end branch)
  const distanceToLeaf = calculateDistanceToLeaf(branch);

  // Get seasonal parameters
  const season = config.season || 'spring';
  const seasonalParams = getSeasonalParams(season);

  // Add leaves to branches within 3 steps of a leaf
  if (distanceToLeaf <= 3 && distanceToLeaf > 0) {
    // More leaves closer to the tips, modified by season
    const baseLeafProbability = 1.0 - distanceToLeaf / 4; // 75% at distance 1, 50% at distance 2, 25% at distance 3
    const leafProbability = baseLeafProbability * seasonalParams.leafDensity;

    if (Math.random() < leafProbability) {
      const numLeaves = Math.floor(Math.random() * 3) + 1; // 1-3 leaves

      for (let i = 0; i < numLeaves; i++) {
        // Position leaves along the branch length
        const positionAlongBranch = 0.3 + Math.random() * 0.7; // 30-100% along branch
        const leafAngle = branch.angle + (Math.random() - 0.5) * Math.PI * 0.8; // ±72 degrees from branch
        const leafDistance = 5 + Math.random() * 8; // 5-13 pixels from branch

        const branchPointX = branch.relativePosition.x * positionAlongBranch;
        const branchPointY = branch.relativePosition.y * positionAlongBranch;

        const leafX = branchPointX + Math.cos(leafAngle) * leafDistance;
        const leafY = branchPointY + Math.sin(leafAngle) * leafDistance;

        const leaf: Leaf = {
          id: `${branch.id}-leaf-${i}`,
          position: {
            x: branch.absolutePosition.x - branch.relativePosition.x + leafX,
            y: branch.absolutePosition.y - branch.relativePosition.y + leafY,
          },
          size: (2 + Math.random() * 3) * seasonalParams.leafSize, // Seasonal size variation
          color:
            seasonalParams.leafColors[Math.floor(Math.random() * seasonalParams.leafColors.length)],
          angle: leafAngle,
        };

        branch.leaves.push(leaf);
      }
    }
  }

  // Recursively add leaves to children
  branch.children.forEach((child) => addLeaves(child, config));
}

function calculateDistanceToLeaf(branch: Branch): number {
  // If this branch has no children, it's a leaf (distance 0)
  if (!branch.children || branch.children.length === 0) {
    return 0;
  }

  // Find the minimum distance to any leaf among children
  let minDistance = Infinity;
  branch.children.forEach((child) => {
    const childDistance = calculateDistanceToLeaf(child);
    minDistance = Math.min(minDistance, childDistance + 1);
  });

  return minDistance;
}

export function getSeasonalParams(season: string) {
  switch (season) {
    case 'spring':
      return {
        leafDensity: 0.8, // 80% of normal leaf density
        leafSize: 0.9, // Slightly smaller, new leaves
        leafColors: [0x90ee90, 0x98fb98, 0x00ff7f, 0x32cd32], // Light greens
      };
    case 'summer':
      return {
        leafDensity: 1.0, // Full leaf density
        leafSize: 1.0, // Normal size
        leafColors: [0x228b22, 0x006400, 0x008000, 0x2e8b57], // Rich greens
      };
    case 'autumn':
    case 'fall':
      return {
        leafDensity: 0.7, // Some leaves have fallen
        leafSize: 1.0, // Normal size
        leafColors: [0xff8c00, 0xff6347, 0xffd700, 0xdc143c, 0x8b4513, 0xff4500], // Oranges, reds, yellows
      };
    case 'winter':
      return {
        leafDensity: 0.1, // Very few leaves
        leafSize: 0.7, // Smaller, withered leaves
        leafColors: [0x8b4513, 0x654321, 0x2f4f4f], // Browns and dark colors
      };
    default:
      return {
        leafDensity: 1.0,
        leafSize: 1.0,
        leafColors: [0x228b22], // Default green
      };
  }
}

function generateBranches(parent: Branch, config: TreeConfig, generation: number) {
  if (generation >= config.maxGenerations) {
    // Terminal branches (leaf branches) - no leaves for now
    if (config.leafDensity > 0) {
      generateLeaves(parent, config);
    }
    return;
  }

  // Determine if this branch advances to next level (50% base chance, weighted by ancestry)
  let currentLevel = generation === 0 ? 0 : parent.level;
  let levelChangeOffset = 0;

  if (generation > 0) {
    const ancestralLevelSum = parent.ancestralLevelSum;

    // Base 50% chance to advance level, weighted by ancestral level changes
    let advanceChance = 0.5;

    // If ancestors have been advancing levels frequently, reduce chance
    if (ancestralLevelSum > 2) {
      advanceChance = Math.max(0.2, 0.5 - (ancestralLevelSum - 2) * 0.1);
    }
    // If ancestors have been staying at same level, increase chance
    else if (ancestralLevelSum < -1) {
      advanceChance = Math.min(0.8, 0.5 + Math.abs(ancestralLevelSum + 1) * 0.1);
    }

    if (Math.random() < advanceChance) {
      currentLevel = parent.level + 1;
      levelChangeOffset = 1;
    }
  }

  // Dynamic branching pattern based on fluid level
  let baseBranches;

  if (currentLevel === 0) {
    // Level 0: base 1-2 main branches
    baseBranches = 1 + Math.floor(Math.random() * 2); // 1 or 2
  } else if (currentLevel === 1) {
    // Level 1: base 2 branches
    baseBranches = 2;
  } else if (currentLevel === 2 || currentLevel === 3) {
    // Level 2-3: base 3 branches
    baseBranches = 3;
  } else {
    // Level 4+: base 2 branches
    baseBranches = 2;
  }

  // Create weighted array of branch count options
  const branchCountOptions = [baseBranches]; // Always include target

  if (generation > 0) {
    const ancestralSum = parent.ancestralOffsetSum;

    // Count positive and negative offsets in heritage
    const negativeOffsets = Math.max(0, -ancestralSum); // Count of -1 offsets
    const positiveOffsets = Math.max(0, ancestralSum); // Count of +1 offsets

    // Only add (target - 1) if there are at least two +1 ancestors
    if (positiveOffsets >= 2) {
      branchCountOptions.push(baseBranches - 1);
    }

    // Always add (target + 1) option
    branchCountOptions.push(baseBranches + 1);

    // For every two -1 offsets in heritage, add another target +1 option
    const bonusPlusOnes = Math.floor(negativeOffsets / 2);
    for (let i = 0; i < bonusPlusOnes; i++) {
      branchCountOptions.push(baseBranches + 1);
    }

    // If there are at least two -1 options, add a target +2 item
    if (negativeOffsets >= 2) {
      branchCountOptions.push(baseBranches + 2);
    }
  } else {
    // For trunk (generation 0), always include -1 and +1 options
    branchCountOptions.push(baseBranches - 1, baseBranches + 1);
  }

  // Shuffle and pop to get random weighted selection
  const shuffledOptions = shuffle(branchCountOptions);
  const numBranches = Math.max(1, shuffledOptions.pop() || baseBranches); // Never allow 0

  // Calculate the actual offset used
  const actualOffset = numBranches - baseBranches;

  for (let i = 0; i < numBranches; i++) {
    let angleOffset, baseAngle, branchAngle, finalAngle;

    if (generation === 0) {
      // Main branches from trunk - limit to 60 degrees total spread
      const maxSpread = Math.PI / 3; // 60 degrees total spread
      angleOffset = (i - (numBranches - 1) / 2) * (maxSpread / Math.max(1, numBranches - 1));
      baseAngle = -Math.PI / 2; // Pointing up (trunk direction)
      branchAngle = baseAngle + angleOffset + (Math.random() - 0.5) * 0.2; // Reduced random variation
      finalAngle = branchAngle;
    } else {
      // Regular branches - relative to parent direction, max 60 degrees spread
      const maxSpread = Math.PI / 3; // 60 degrees total spread
      angleOffset = (i - (numBranches - 1) / 2) * (maxSpread / Math.max(1, numBranches - 1));

      // Use parent's angle as base direction
      baseAngle = parent.angle;
      branchAngle = baseAngle + angleOffset + (Math.random() - 0.5) * 0.3;

      // Slight upward bias to make tree grow upward
      const upwardBias = -0.1;
      finalAngle = branchAngle + upwardBias;
    }

    const branchLength = parent.length * config.lengthDecay * (0.75 + Math.random() * 0.3) * 1.11; // Scaled up 11%
    const branchThickness = Math.max(2, parent.thickness * 0.7); // Minimum thickness of 2px

    // Calculate relative position and absolute position
    const relativeX = Math.cos(finalAngle) * branchLength;
    const relativeY = Math.sin(finalAngle) * branchLength;

    const absolutePosition: Point = {
      x: parent.absolutePosition.x + relativeX,
      y: parent.absolutePosition.y + relativeY,
    };

    const branch: Branch = {
      id: `${parent.id}-${i}`,
      relativePosition: { x: relativeX, y: relativeY },
      absolutePosition: { ...absolutePosition },
      angle: finalAngle,
      thickness: branchThickness,
      length: branchLength,
      children: [],
      leaves: [],
      generation: generation + 1,
      level: currentLevel, // Fluid level (may be same as parent or +1)
      color: generateBranchColor(parent.color), // Color variation from parent
      branchCountOffset: actualOffset, // Store the offset used for this generation
      ancestralOffsetSum: parent.ancestralOffsetSum + actualOffset, // Cumulative sum
      levelChangeOffset: levelChangeOffset, // +1 if level increased, 0 if stayed same
      ancestralLevelSum: parent.ancestralLevelSum + levelChangeOffset, // Cumulative level changes
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
  season: 'spring', // Default to spring to match initial state
};
