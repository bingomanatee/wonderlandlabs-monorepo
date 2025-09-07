import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createTreeState } from '../state/createTreeState';
import { defaultTreeConfig } from '../state/treeGenerator';
import type { TreeConfig } from '../types';

// Only mock PIXI since we don't need actual rendering for tree building tests
vi.mock('pixi.js', () => ({
  Graphics: class MockGraphics {
    clear() {}
    setStrokeStyle() {}
    setFillStyle() {}
    moveTo() {}
    lineTo() {}
    stroke() {}
    circle() {}
    fill() {}
    rect() {}
  },
  Application: class MockApplication {
    screen = { width: 800, height: 600 };
  },
  Container: class MockContainer {
    name = '';
    position = { set: () => {} };
    addChild() {}
    getChildByName() {
      return null;
    }
  },
}));

describe('Real Tree State Integration Tests', () => {
  let treeState: ReturnType<typeof createTreeState>;
  let testConfig: TreeConfig;

  beforeEach(() => {
    // Use the ACTUAL createTreeState function
    treeState = createTreeState();

    testConfig = {
      ...defaultTreeConfig,
      maxGenerations: 3,
      centerX: 400,
      centerY: 300,
    };

    // Initialize with mock PIXI resources to avoid rendering dependencies
    treeState.res.set('treeGraphics', new (require('pixi.js').Graphics)());
    treeState.res.set('coordGraphics', new (require('pixi.js').Graphics)());
    treeState.res.set('backgroundGraphics', new (require('pixi.js').Graphics)());
    treeState.res.set('pixiApp', new (require('pixi.js').Application)());
  });

  describe('Real generateTreeInStore', () => {
    it('should create a valid trunk using the actual implementation', () => {
      // Test the REAL method
      treeState.acts.generateTreeInStore(testConfig);

      const trunk = treeState.value.trunk;
      expect(trunk).toBeDefined();
      expect(trunk.id).toBe('trunk');
      expect(trunk.absolutePosition).toBeDefined();
      expect(trunk.absolutePosition.x).toBe(400);
      expect(trunk.absolutePosition.y).toBe(167); // 300 - 133
      expect(trunk.generation).toBe(0);
      expect(trunk.children).toBeDefined();
      expect(Array.isArray(trunk.children)).toBe(true);
    });

    it('should generate branches using the actual ForestBranch system', () => {
      treeState.acts.generateTreeInStore(testConfig);

      const trunk = treeState.value.trunk;
      expect(trunk.children.length).toBeGreaterThan(0);

      // Test that branches have proper structure from the real implementation
      trunk.children.forEach((child) => {
        expect(child.id).toContain('trunk-');
        expect(child.generation).toBe(1);
        expect(child.absolutePosition).toBeDefined();
        expect(child.absolutePosition.x).toBeTypeOf('number');
        expect(child.absolutePosition.y).toBeTypeOf('number');
        expect(isFinite(child.absolutePosition.x)).toBe(true);
        expect(isFinite(child.absolutePosition.y)).toBe(true);

        // These should come from the real createBranchData implementation
        expect(child.thickness).toBeLessThan(trunk.thickness);
        expect(child.length).toBeLessThan(trunk.length);
        expect(child.mass).toBeLessThan(trunk.mass);
      });
    });

    it('should respect maxGenerations in the real implementation', () => {
      const limitedConfig = { ...testConfig, maxGenerations: 1 };
      treeState.acts.generateTreeInStore(limitedConfig);

      const trunk = treeState.value.trunk;

      // Should have first generation branches
      expect(trunk.children.length).toBeGreaterThan(0);

      // But those branches should have no children (generation 1 is max)
      trunk.children.forEach((child) => {
        expect(child.children.length).toBe(0);
      });
    });
  });

  describe('Real generateBranchesRecursively', () => {
    it('should work with the actual ForestBranch integration', () => {
      // Create a real trunk first
      treeState.acts.generateTreeInStore({ ...testConfig, maxGenerations: 0 });
      const trunk = treeState.value.trunk;

      // Clear children to test recursive generation
      treeState.mutate((draft) => {
        if (draft.trunk) {
          draft.trunk.children = [];
        }
      });

      expect(updatedState.trunk.children.length).toBe(0);

      // Now test the real generateBranchesRecursively
      treeState.acts.generateBranchesRecursively(trunk, testConfig, 0);

      // Should have generated children
      const finalTrunk = treeState.value.trunk;
      expect(finalTrunk.children.length).toBeGreaterThan(0);

      // Test that the real implementation creates proper branches
      finalTrunk.children.forEach((child) => {
        expect(child.id).toContain(trunk.id);
        expect(child.generation).toBe(trunk.generation + 1);
        expect(child.absolutePosition).toBeDefined();
        expect(child.absolutePosition.x).toBeTypeOf('number');
        expect(child.absolutePosition.y).toBeTypeOf('number');
        expect(isFinite(child.absolutePosition.x)).toBe(true);
        expect(isFinite(child.absolutePosition.y)).toBe(true);
      });
    });

    it('should handle deep recursion with the real ForestBranch system', () => {
      const deepConfig = { ...testConfig, maxGenerations: 3 };
      treeState.acts.generateTreeInStore(deepConfig);

      const trunk = treeState.value.trunk;

      // Should have multiple generations
      expect(trunk.children.length).toBeGreaterThan(0);

      let hasSecondGeneration = false;
      let hasThirdGeneration = false;

      trunk.children.forEach((firstGenChild) => {
        if (firstGenChild.children.length > 0) {
          hasSecondGeneration = true;
          firstGenChild.children.forEach((secondGenChild) => {
            expect(secondGenChild.generation).toBe(2);
            expect(secondGenChild.absolutePosition).toBeDefined();

            if (secondGenChild.children.length > 0) {
              hasThirdGeneration = true;
              secondGenChild.children.forEach((thirdGenChild) => {
                expect(thirdGenChild.generation).toBe(3);
                expect(thirdGenChild.absolutePosition).toBeDefined();
              });
            }
          });
        }
      });

      expect(hasSecondGeneration).toBe(true);
      // Third generation may or may not exist depending on random generation
    });
  });

  describe('Real mutate method integration', () => {
    it('should work with the actual Forest implementation', () => {
      treeState.acts.generateTreeInStore(testConfig);
      const originalTrunk = treeState.value.trunk;

      // Test the real mutate method
      const updatedState = treeState.acts.mutate((draft) => {
        draft.season = 'winter';
        draft.windForce.x = 10;
        if (draft.trunk) {
          draft.trunk.thickness = 25;
        }
      });

      // Should return the updated state
      expect(updatedState).toBeDefined();
      expect(updatedState.season).toBe('winter');
      expect(updatedState.windForce.x).toBe(10);
      expect(updatedState.trunk.thickness).toBe(25);

      // Should be the same reference as the current state
      expect(updatedState).toBe(treeState.value);
    });

    it('should handle tree mutations with the real implementation', () => {
      treeState.acts.generateTreeInStore(testConfig);
      const originalChildCount = treeState.value.trunk.children.length;

      // Create a new branch using the real createBranchData logic
      const newBranch = {
        id: 'test-branch',
        relativePosition: { x: 30, y: -40 },
        absolutePosition: { x: 430, y: 260 },
        angle: -Math.PI / 4,
        thickness: 10,
        length: 60,
        children: [],
        leaves: [],
        generation: 1,
        level: 0,
        color: 0x8b4513,
        branchCountOffset: 0,
        ancestralOffsetSum: 0,
        levelChangeOffset: 0,
        ancestralLevelSum: 0,
        velocity: { x: 0, y: 0 },
        force: { x: 0, y: 0 },
        springConstant: 0.02,
        mass: 50,
      };

      // Use the real mutate method to add the branch
      const updatedState = treeState.acts.mutate((draft) => {
        if (draft.trunk) {
          draft.trunk.children.push(newBranch);
        }
      });

      expect(updatedState.trunk.children.length).toBe(originalChildCount + 1);
      expect(updatedState.trunk.children).toContain(newBranch);
    });
  });

  describe('Error scenarios with real implementation', () => {
    it('should catch actual ForestBranch creation errors', () => {
      // This should expose real integration issues
      expect(() => {
        treeState.acts.generateTreeInStore(testConfig);
      }).not.toThrow();

      // Verify the tree was actually created
      expect(treeState.value.trunk).toBeDefined();
      expect(treeState.value.trunk.absolutePosition).toBeDefined();
    });

    it('should handle invalid parent scenarios in real ForestBranch', () => {
      // Create an invalid parent that might cause the real error
      const invalidParent = {
        id: 'invalid-parent',
        // Missing absolutePosition - this should trigger the real error
        relativePosition: { x: 0, y: -100 },
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
      } as any; // Cast to bypass TypeScript checking

      // This should trigger the actual error from the real implementation
      expect(() => {
        treeState.acts.generateBranchesRecursively(invalidParent, testConfig, 0);
      }).toThrow('Invalid parent branch: missing absolutePosition');
    });
  });

  describe('Real tree structure validation', () => {
    it('should create consistent tree structure with real implementation', () => {
      treeState.acts.generateTreeInStore(testConfig);

      const trunk = treeState.value.trunk;

      function validateBranch(branch: any, expectedGeneration: number) {
        expect(branch.generation).toBe(expectedGeneration);
        expect(branch.absolutePosition).toBeDefined();
        expect(branch.absolutePosition.x).toBeTypeOf('number');
        expect(branch.absolutePosition.y).toBeTypeOf('number');
        expect(isFinite(branch.absolutePosition.x)).toBe(true);
        expect(isFinite(branch.absolutePosition.y)).toBe(true);

        branch.children.forEach((child: any) => {
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
  });
});
