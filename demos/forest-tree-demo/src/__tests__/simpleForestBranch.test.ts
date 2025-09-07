import { describe, it, expect } from 'vitest';
import { defaultTreeConfig } from '../state/treeGenerator';
import type { Branch, TreeConfig } from '../types';

describe('Simple ForestBranch Logic Tests', () => {
  let testConfig: TreeConfig;
  let validParent: Branch;

  beforeEach(() => {
    testConfig = {
      ...defaultTreeConfig,
      maxGenerations: 3,
      centerX: 400,
      centerY: 300,
    };

    validParent = {
      id: 'trunk',
      relativePosition: { x: 0, y: -100 },
      absolutePosition: { x: 400, y: 200 },
      angle: -Math.PI / 2,
      thickness: 18,
      length: 100,
      children: [],
      leaves: [],
      generation: 0,
      level: 0,
      color: 0x8b4513,
      branchCountOffset: 0,
      ancestralOffsetSum: 0,
      levelChangeOffset: 0,
      ancestralLevelSum: 0,
      velocity: { x: 0, y: 0 },
      force: { x: 0, y: 0 },
      springConstant: 0.02,
      mass: 100,
    };
  });

  it('should validate that test parent has absolutePosition', () => {
    expect(validParent.absolutePosition).toBeDefined();
    expect(validParent.absolutePosition.x).toBe(400);
    expect(validParent.absolutePosition.y).toBe(200);
  });

  it('should simulate createBranchData logic correctly', () => {
    const index = 0;
    const numBranches = 3;
    const generation = 1;

    // Validate parent first (this is what's failing)
    if (!validParent) {
      throw new Error('Invalid parent branch: parent is null/undefined');
    }
    if (!validParent.absolutePosition) {
      throw new Error(`Invalid parent branch: missing absolutePosition. Parent ID: ${validParent.id || 'unknown'}`);
    }

    // Calculate angle
    const maxSpread = Math.PI / 3;
    const angleOffset = (index - (numBranches - 1) / 2) * (maxSpread / Math.max(1, numBranches - 1));
    const finalAngle = validParent.angle + angleOffset + (Math.random() - 0.5) * 0.3 - 0.1;

    const branchLength = validParent.length * testConfig.lengthDecay * (0.75 + Math.random() * 0.3) * 1.11;
    const branchThickness = Math.max(2, validParent.thickness * 0.7);

    const relativeX = Math.cos(finalAngle) * branchLength;
    const relativeY = Math.sin(finalAngle) * branchLength;

    const newBranch: Branch = {
      id: `${validParent.id}-${index}`,
      relativePosition: { x: relativeX, y: relativeY },
      absolutePosition: {
        x: validParent.absolutePosition.x + relativeX,
        y: validParent.absolutePosition.y + relativeY,
      },
      angle: finalAngle,
      thickness: branchThickness,
      length: branchLength,
      children: [],
      leaves: [],
      generation: generation + 1,
      level: validParent.level,
      color: 0x8b4513,
      branchCountOffset: 0,
      ancestralOffsetSum: validParent.ancestralOffsetSum,
      levelChangeOffset: 0,
      ancestralLevelSum: validParent.ancestralLevelSum,
      velocity: { x: 0, y: 0 },
      force: { x: 0, y: 0 },
      springConstant: 0.02,
      mass: validParent.mass / 2,
    };

    // Validate the created branch has absolutePosition
    expect(newBranch.absolutePosition).toBeDefined();
    expect(typeof newBranch.absolutePosition.x).toBe('number');
    expect(typeof newBranch.absolutePosition.y).toBe('number');
    expect(isFinite(newBranch.absolutePosition.x)).toBe(true);
    expect(isFinite(newBranch.absolutePosition.y)).toBe(true);

    // The new branch should be valid for use as a parent in recursive calls
    expect(newBranch.id).toBe('trunk-0');
    expect(newBranch.generation).toBe(2);
  });

  it('should detect missing absolutePosition in parent', () => {
    const invalidParent = { ...validParent };
    delete (invalidParent as any).absolutePosition;

    expect(() => {
      if (!invalidParent.absolutePosition) {
        throw new Error(`Invalid parent branch: missing absolutePosition. Parent ID: ${invalidParent.id || 'unknown'}`);
      }
    }).toThrow('Invalid parent branch: missing absolutePosition. Parent ID: trunk');
  });

  it('should handle recursive branch creation simulation', () => {
    // Simulate the recursive process
    const generations = [validParent];
    
    // First generation
    const firstGenBranches = [];
    for (let i = 0; i < 2; i++) {
      const newBranch = createSimulatedBranch(validParent, i, 2, testConfig, 1);
      firstGenBranches.push(newBranch);
      validParent.children.push(newBranch);
    }

    // Second generation - this is where the error might occur
    firstGenBranches.forEach((parent, parentIndex) => {
      expect(parent.absolutePosition).toBeDefined();
      expect(parent.absolutePosition.x).toBeTypeOf('number');
      expect(parent.absolutePosition.y).toBeTypeOf('number');
      
      for (let i = 0; i < 2; i++) {
        const newBranch = createSimulatedBranch(parent, i, 2, testConfig, 2);
        expect(newBranch.absolutePosition).toBeDefined();
        parent.children.push(newBranch);
      }
    });

    // Verify the tree structure
    expect(validParent.children.length).toBe(2);
    validParent.children.forEach(child => {
      expect(child.children.length).toBe(2);
      expect(child.absolutePosition).toBeDefined();
    });
  });
});

// Helper function to simulate createBranchData
function createSimulatedBranch(parent: Branch, index: number, numBranches: number, config: TreeConfig, generation: number): Branch {
  // Validation
  if (!parent) {
    throw new Error('Invalid parent branch: parent is null/undefined');
  }
  if (!parent.absolutePosition) {
    throw new Error(`Invalid parent branch: missing absolutePosition. Parent ID: ${parent.id || 'unknown'}`);
  }

  // Calculate angle
  const maxSpread = Math.PI / 3;
  const angleOffset = (index - (numBranches - 1) / 2) * (maxSpread / Math.max(1, numBranches - 1));
  const finalAngle = parent.angle + angleOffset + (Math.random() - 0.5) * 0.3 - 0.1;

  const branchLength = parent.length * config.lengthDecay * (0.75 + Math.random() * 0.3) * 1.11;
  const branchThickness = Math.max(2, parent.thickness * 0.7);

  const relativeX = Math.cos(finalAngle) * branchLength;
  const relativeY = Math.sin(finalAngle) * branchLength;

  return {
    id: `${parent.id}-${index}`,
    relativePosition: { x: relativeX, y: relativeY },
    absolutePosition: {
      x: parent.absolutePosition.x + relativeX,
      y: parent.absolutePosition.y + relativeY,
    },
    angle: finalAngle,
    thickness: branchThickness,
    length: branchLength,
    children: [],
    leaves: [],
    generation: generation + 1,
    level: parent.level,
    color: 0x8b4513,
    branchCountOffset: 0,
    ancestralOffsetSum: parent.ancestralOffsetSum,
    levelChangeOffset: 0,
    ancestralLevelSum: parent.ancestralLevelSum,
    velocity: { x: 0, y: 0 },
    force: { x: 0, y: 0 },
    springConstant: 0.02,
    mass: parent.mass / 2,
  };
}
