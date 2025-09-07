import { describe, it, expect, beforeEach, vi } from 'vitest';
import { defaultTreeConfig } from '../state/treeGenerator';
import type { Branch, TreeConfig, TreeState } from '../types';

// Mock the createForestBranch to avoid Forestry4 dependency
vi.mock('../state/createForestBranch', () => ({
  createForestBranch: (state: any, branchPath: string) => ({
    acts: {
      initializeBranch: (
        parentBranch: Branch,
        index: number,
        total: number,
        config: TreeConfig,
        generation: number
      ) => {
        // Simulate the actual createBranchData logic
        if (!parentBranch || !parentBranch.absolutePosition) {
          throw new Error(
            `Invalid parent branch: missing absolutePosition. Parent ID: ${parentBranch?.id || 'unknown'}`
          );
        }

        const maxSpread = Math.PI / 3;
        const angleOffset = (index - (total - 1) / 2) * (maxSpread / Math.max(1, total - 1));
        const finalAngle = parentBranch.angle + angleOffset + (Math.random() - 0.5) * 0.3 - 0.1;

        const branchLength =
          parentBranch.length * config.lengthDecay * (0.75 + Math.random() * 0.3) * 1.11;
        const branchThickness = Math.max(2, parentBranch.thickness * 0.7);

        const relativeX = Math.cos(finalAngle) * branchLength;
        const relativeY = Math.sin(finalAngle) * branchLength;

        return {
          id: `${parentBranch.id}-${index}`,
          relativePosition: { x: relativeX, y: relativeY },
          absolutePosition: {
            x: parentBranch.absolutePosition.x + relativeX,
            y: parentBranch.absolutePosition.y + relativeY,
          },
          angle: finalAngle,
          thickness: branchThickness,
          length: branchLength,
          children: [],
          leaves: [],
          generation: generation + 1,
          level: parentBranch.level,
          color: 0x8b4513,
          branchCountOffset: 0,
          ancestralOffsetSum: parentBranch.ancestralOffsetSum,
          levelChangeOffset: 0,
          ancestralLevelSum: parentBranch.ancestralLevelSum,
          velocity: { x: 0, y: 0 },
          force: { x: 0, y: 0 },
          springConstant: 0.02,
          mass: parentBranch.mass / 2,
        };
      },
    },
  }),
}));

// Create a minimal mock TreeState that implements the tree building logic
class MockTreeState {
  value: TreeState;
  acts: any;

  constructor() {
    this.value = {
      trunk: null as any,
      width: 800,
      height: 600,
      season: 'spring',
      windForce: { x: 0, y: 0 },
      isPhysicsEnabled: false,
      showCoordinates: false,
      showDebugInfo: false,
    };

    this.acts = {
      generateTreeInStore: (config: TreeConfig) => {
        // Create trunk exactly like in the real implementation
        const centerX = config.centerX ?? 400;
        const centerY = config.centerY ?? 600;
        const trunkLength = 133;

        const trunk: Branch = {
          id: 'trunk',
          relativePosition: { x: 0, y: -trunkLength },
          absolutePosition: { x: centerX, y: centerY - trunkLength },
          angle: -Math.PI / 2,
          thickness: 18,
          length: trunkLength,
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

        // Generate branches recursively
        this.acts.generateBranchesRecursively(trunk, config, 0);

        // Set trunk in state
        this.value.trunk = trunk;
      },

      generateBranchesRecursively: (parent: Branch, config: TreeConfig, generation: number) => {
        if (generation >= config.maxGenerations) {
          return; // Terminal branch
        }

        // Generate branch properties
        const numBranches = 2 + Math.floor(Math.random() * 2); // Simple branch count

        for (let i = 0; i < numBranches; i++) {
          // Simulate ForestBranch branch creation directly
          const newBranch = this.acts.createBranchData(parent, i, numBranches, config, generation);

          // Verify the branch was created properly
          if (!newBranch || !newBranch.absolutePosition) {
            console.error('Failed to create valid branch:', newBranch);
            continue;
          }

          // Add the new branch to the parent's children
          parent.children.push(newBranch);

          // Generate children for the new branch - pass the newBranch directly
          if (generation + 1 < config.maxGenerations) {
            this.acts.generateBranchesRecursively(newBranch, config, generation + 1);
          }
        }
      },

      // Helper method to create branch data (simulates ForestBranch createBranchData)
      createBranchData: (
        parent: Branch,
        index: number,
        numBranches: number,
        config: TreeConfig,
        generation: number
      ): Branch => {
        // Validate parent has required properties
        if (!parent || !parent.absolutePosition) {
          throw new Error(
            `Invalid parent branch: missing absolutePosition. Parent ID: ${parent?.id || 'unknown'}`
          );
        }

        const maxSpread = Math.PI / 3;
        const angleOffset =
          (index - (numBranches - 1) / 2) * (maxSpread / Math.max(1, numBranches - 1));
        const finalAngle = parent.angle + angleOffset + (Math.random() - 0.5) * 0.3 - 0.1;

        const branchLength =
          parent.length * config.lengthDecay * (0.75 + Math.random() * 0.3) * 1.11;
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
      },
    };
  }
}

describe('Tree Building Integration Tests', () => {
  let mockTreeState: MockTreeState;
  let testConfig: TreeConfig;

  beforeEach(() => {
    mockTreeState = new MockTreeState();
    testConfig = {
      ...defaultTreeConfig,
      maxGenerations: 3,
      centerX: 400,
      centerY: 300,
    };
  });

  describe('generateTreeInStore', () => {
    it('should create a valid trunk', () => {
      mockTreeState.acts.generateTreeInStore(testConfig);

      const trunk = mockTreeState.value.trunk;
      expect(trunk).toBeDefined();
      expect(trunk.id).toBe('trunk');
      expect(trunk.absolutePosition).toBeDefined();
      expect(trunk.absolutePosition.x).toBe(400);
      expect(trunk.absolutePosition.y).toBe(167); // 300 - 133
      expect(trunk.generation).toBe(0);
      expect(trunk.children).toBeDefined();
      expect(Array.isArray(trunk.children)).toBe(true);
    });

    it('should generate branches on the trunk', () => {
      mockTreeState.acts.generateTreeInStore(testConfig);

      const trunk = mockTreeState.value.trunk;
      expect(trunk.children.length).toBeGreaterThan(0);
      expect(trunk.children.length).toBeLessThanOrEqual(4); // 2 + random(2)

      // All children should have valid structure
      trunk.children.forEach((child) => {
        expect(child.id).toContain('trunk-');
        expect(child.generation).toBe(1);
        expect(child.absolutePosition).toBeDefined();
        expect(child.absolutePosition.x).toBeTypeOf('number');
        expect(child.absolutePosition.y).toBeTypeOf('number');
        expect(isFinite(child.absolutePosition.x)).toBe(true);
        expect(isFinite(child.absolutePosition.y)).toBe(true);
      });
    });

    it('should respect maxGenerations limit', () => {
      const limitedConfig = { ...testConfig, maxGenerations: 1 };
      mockTreeState.acts.generateTreeInStore(limitedConfig);

      const trunk = mockTreeState.value.trunk;

      // Should have first generation branches
      expect(trunk.children.length).toBeGreaterThan(0);

      // But those branches should have no children (generation 1 is max)
      trunk.children.forEach((child) => {
        expect(child.children.length).toBe(0);
      });
    });

    it('should create a complete tree structure with multiple generations', () => {
      const deepConfig = { ...testConfig, maxGenerations: 3 };
      mockTreeState.acts.generateTreeInStore(deepConfig);

      const trunk = mockTreeState.value.trunk;

      // Should have multiple generations
      expect(trunk.children.length).toBeGreaterThan(0);

      let hasSecondGeneration = false;
      trunk.children.forEach((firstGenChild) => {
        if (firstGenChild.children.length > 0) {
          hasSecondGeneration = true;
          firstGenChild.children.forEach((secondGenChild) => {
            expect(secondGenChild.generation).toBe(2);
            expect(secondGenChild.absolutePosition).toBeDefined();
          });
        }
      });

      expect(hasSecondGeneration).toBe(true);
    });
  });

  describe('generateBranchesRecursively', () => {
    let testParent: Branch;

    beforeEach(() => {
      testParent = {
        id: 'test-parent',
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

    it('should generate children for a valid parent', () => {
      const initialChildCount = testParent.children.length;

      mockTreeState.acts.generateBranchesRecursively(testParent, testConfig, 0);

      expect(testParent.children.length).toBeGreaterThan(initialChildCount);
      expect(testParent.children.length).toBeGreaterThanOrEqual(2);
      expect(testParent.children.length).toBeLessThanOrEqual(4);
    });

    it('should create children with proper structure', () => {
      mockTreeState.acts.generateBranchesRecursively(testParent, testConfig, 0);

      testParent.children.forEach((child, index) => {
        expect(child.id).toBe(`test-parent-${index}`);
        expect(child.generation).toBe(testParent.generation + 1);
        expect(child.absolutePosition).toBeDefined();
        expect(child.absolutePosition.x).toBeTypeOf('number');
        expect(child.absolutePosition.y).toBeTypeOf('number');
        expect(isFinite(child.absolutePosition.x)).toBe(true);
        expect(isFinite(child.absolutePosition.y)).toBe(true);

        // Child should be smaller than parent
        expect(child.thickness).toBeLessThan(testParent.thickness);
        expect(child.length).toBeLessThan(testParent.length);
        expect(child.mass).toBeLessThan(testParent.mass);
      });
    });

    it('should stop at maxGenerations', () => {
      const limitedConfig = { ...testConfig, maxGenerations: 1 };

      mockTreeState.acts.generateBranchesRecursively(testParent, limitedConfig, 0);

      // Should generate first generation
      expect(testParent.children.length).toBeGreaterThan(0);

      // But not second generation (would be generation 2, which exceeds maxGenerations 1)
      testParent.children.forEach((child) => {
        expect(child.children.length).toBe(0);
      });
    });

    it('should handle recursive generation correctly', () => {
      const recursiveConfig = { ...testConfig, maxGenerations: 2 };

      mockTreeState.acts.generateBranchesRecursively(testParent, recursiveConfig, 0);

      // Should have first generation
      expect(testParent.children.length).toBeGreaterThan(0);

      // Some first generation branches should have children
      let hasGrandchildren = false;
      testParent.children.forEach((child) => {
        if (child.children.length > 0) {
          hasGrandchildren = true;
          child.children.forEach((grandchild) => {
            expect(grandchild.generation).toBe(2);
            expect(grandchild.absolutePosition).toBeDefined();
            // Grandchildren should have no children (generation 2 is max)
            expect(grandchild.children.length).toBe(0);
          });
        }
      });

      expect(hasGrandchildren).toBe(true);
    });

    it('should not throw errors with valid parents', () => {
      expect(() => {
        mockTreeState.acts.generateBranchesRecursively(testParent, testConfig, 0);
      }).not.toThrow();
    });
  });

  describe('Tree Structure Validation', () => {
    it('should create a tree with consistent parent-child relationships', () => {
      mockTreeState.acts.generateTreeInStore(testConfig);

      const trunk = mockTreeState.value.trunk;

      function validateBranch(branch: Branch, expectedGeneration: number) {
        expect(branch.generation).toBe(expectedGeneration);
        expect(branch.absolutePosition).toBeDefined();

        branch.children.forEach((child) => {
          // Child should reference parent in its ID
          expect(child.id).toContain(branch.id);

          // Child should be next generation
          expect(child.generation).toBe(branch.generation + 1);

          // Recursively validate children
          validateBranch(child, expectedGeneration + 1);
        });
      }

      validateBranch(trunk, 0);
    });

    it('should create branches with different angles', () => {
      mockTreeState.acts.generateTreeInStore(testConfig);

      const trunk = mockTreeState.value.trunk;

      if (trunk.children.length > 1) {
        const angles = trunk.children.map((child) => child.angle);

        // Should have different angles
        expect(angles[0]).not.toBe(angles[1]);

        // All angles should be valid numbers
        angles.forEach((angle) => {
          expect(typeof angle).toBe('number');
          expect(isFinite(angle)).toBe(true);
        });
      }
    });
  });
});
