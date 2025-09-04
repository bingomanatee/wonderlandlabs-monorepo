import { generateTree, defaultTreeConfig } from '../state/treeGenerator.ts';
import type { Branch } from '../types';

describe('Tree Generator', () => {
  test('should create a valid tree structure', () => {
    const config = {
      ...defaultTreeConfig,
      maxGenerations: 3, // Keep it small for testing
      branchCount: 2,
    };

    const tree = generateTree(config);

    // Test trunk properties
    expect(tree.id).toBe('trunk');
    expect(tree.generation).toBe(0);
    expect(tree.level).toBe(0);
    expect(tree.relativePosition).toEqual({ x: 0, y: 0 });
    expect(tree.absolutePosition).toBeDefined();
    expect(tree.absolutePosition.x).toBeCloseTo(config.centerX || 400);
    expect(tree.angle).toBeCloseTo(-Math.PI / 2); // Pointing up
    expect(tree.thickness).toBeGreaterThan(0);
    expect(tree.length).toBeGreaterThan(0);
    expect(tree.children).toBeDefined();
    expect(Array.isArray(tree.children)).toBe(true);
  });

  test('should create branches with proper relative coordinates', () => {
    const config = {
      ...defaultTreeConfig,
      maxGenerations: 2,
      branchCount: 2,
    };

    const tree = generateTree(config);

    // Check that trunk has children
    expect(tree.children.length).toBeGreaterThan(0);

    // Test first child branch
    const firstChild = tree.children[0];
    expect(firstChild.id).toContain('trunk-');
    expect(firstChild.generation).toBe(1);
    expect(firstChild.relativePosition).toBeDefined();
    expect(firstChild.absolutePosition).toBeDefined();
    expect(firstChild.angle).toBeDefined();

    // Relative position should not be (0,0) for children
    expect(firstChild.relativePosition.x !== 0 || firstChild.relativePosition.y !== 0).toBe(true);

    // Absolute position should be calculated correctly
    const expectedAbsX = tree.absolutePosition.x + firstChild.relativePosition.x;
    const expectedAbsY = tree.absolutePosition.y + firstChild.relativePosition.y;
    expect(firstChild.absolutePosition.x).toBeCloseTo(expectedAbsX, 5);
    expect(firstChild.absolutePosition.y).toBeCloseTo(expectedAbsY, 5);
  });

  test('should maintain tree hierarchy', () => {
    const config = {
      ...defaultTreeConfig,
      maxGenerations: 3,
      branchCount: 2,
    };

    const tree = generateTree(config);

    // Recursive function to validate tree structure
    const validateBranch = (branch: Branch, expectedGeneration: number) => {
      expect(branch.generation).toBe(expectedGeneration);
      expect(branch.id).toBeDefined();
      expect(branch.relativePosition).toBeDefined();
      expect(branch.absolutePosition).toBeDefined();
      expect(branch.angle).toBeDefined();
      expect(branch.thickness).toBeGreaterThan(0);
      expect(branch.length).toBeGreaterThan(0);
      expect(branch.color).toBeDefined();

      // Check children
      if (branch.children && branch.children.length > 0) {
        branch.children.forEach((child) => {
          validateBranch(child, expectedGeneration + 1);
        });
      }
    };

    validateBranch(tree, 0);
  });

  test('should respect generation limits', () => {
    const maxGenerations = 2;
    const config = {
      ...defaultTreeConfig,
      maxGenerations,
      branchCount: 3,
    };

    const tree = generateTree(config);

    // Recursive function to find max generation (excluding twigs)
    const findMaxGeneration = (branch: Branch): number => {
      let maxGen = branch.generation;
      if (branch.children) {
        branch.children.forEach((child) => {
          // Skip twigs (they have 'twig' in their ID)
          if (!child.id.includes('twig')) {
            maxGen = Math.max(maxGen, findMaxGeneration(child));
          }
        });
      }
      return maxGen;
    };

    const actualMaxGeneration = findMaxGeneration(tree);
    expect(actualMaxGeneration).toBeLessThanOrEqual(maxGenerations);
  });

  test('should have decreasing thickness with generation', () => {
    const config = {
      ...defaultTreeConfig,
      maxGenerations: 3,
      branchCount: 2,
    };

    const tree = generateTree(config);

    // Check that children have smaller thickness than parent
    const checkThickness = (branch: Branch) => {
      if (branch.children && branch.children.length > 0) {
        branch.children.forEach((child) => {
          expect(child.thickness).toBeLessThanOrEqual(branch.thickness);
          checkThickness(child);
        });
      }
    };

    checkThickness(tree);
  });

  test('should create valid angles', () => {
    const config = {
      ...defaultTreeConfig,
      maxGenerations: 2,
      branchCount: 3,
    };

    const tree = generateTree(config);

    // Check that all angles are valid numbers
    const checkAngles = (branch: Branch) => {
      expect(typeof branch.angle).toBe('number');
      expect(branch.angle).toBeGreaterThanOrEqual(-Math.PI * 2);
      expect(branch.angle).toBeLessThanOrEqual(Math.PI * 2);

      if (branch.children) {
        branch.children.forEach((child) => {
          checkAngles(child);
        });
      }
    };

    checkAngles(tree);
  });
});
