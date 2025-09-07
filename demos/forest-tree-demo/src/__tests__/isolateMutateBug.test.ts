import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createTreeState } from '../state/createTreeState';
import { defaultTreeConfig } from '../state/treeGenerator';
import type { TreeConfig, Branch } from '../types';

// Only mock PIXI since we don't need actual rendering
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

describe('Isolate Mutate Bug', () => {
  let treeState: ReturnType<typeof createTreeState>;
  let testConfig: TreeConfig;

  beforeEach(() => {
    treeState = createTreeState();

    testConfig = {
      ...defaultTreeConfig,
      maxGenerations: 2,
      centerX: 400,
      centerY: 300,
    };

    // Initialize with mock PIXI resources
    treeState.res.set('treeGraphics', new (require('pixi.js').Graphics)());
    treeState.res.set('coordGraphics', new (require('pixi.js').Graphics)());
    treeState.res.set('backgroundGraphics', new (require('pixi.js').Graphics)());
    treeState.res.set('pixiApp', new (require('pixi.js').Application)());
  });

  describe('Isolate the exact mutate problem', () => {
    it('should test mutate with simple trunk modification', () => {
      // First create a trunk manually
      const trunk: Branch = {
        id: 'trunk',
        relativePosition: { x: 0, y: -133 },
        absolutePosition: { x: 400, y: 167 },
        angle: -Math.PI / 2,
        thickness: 18,
        length: 133,
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

      // Set the trunk directly
      treeState.set('trunk', trunk);

      console.log('Initial trunk children:', treeState.value.trunk.children.length);
      expect(treeState.value.trunk.children.length).toBe(0);

      // Create a test child
      const testChild: Branch = {
        id: 'trunk-0',
        relativePosition: { x: 10, y: -50 },
        absolutePosition: { x: 410, y: 117 },
        angle: -Math.PI / 3,
        thickness: 12,
        length: 70,
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

      // Test the exact mutate pattern from generateBranchesRecursively
      console.log('Before mutate - trunk children:', treeState.value.trunk.children.length);

      const updatedState = treeState.acts.mutate((draft) => {
        console.log('Inside mutate - draft.trunk exists:', !!draft.trunk);
        console.log('Inside mutate - draft.trunk.id:', draft.trunk?.id);
        console.log('Inside mutate - draft.trunk.children.length:', draft.trunk?.children.length);

        // Find the parent in the draft tree and add the new branch
        const findAndUpdateParent = (branch: Branch): boolean => {
          console.log('Checking branch:', branch.id, 'against target: trunk');
          if (branch.id === 'trunk') {
            console.log('Found trunk! Adding child...');
            branch.children.push(testChild);
            console.log('After push - branch.children.length:', branch.children.length);
            return true;
          }
          return branch.children.some((child) => findAndUpdateParent(child));
        };

        if (draft.trunk) {
          const found = findAndUpdateParent(draft.trunk);
          console.log('findAndUpdateParent returned:', found);
        }
      });

      console.log(
        'After mutate - returned state trunk children:',
        updatedState.trunk.children.length
      );
      console.log(
        'After mutate - current state trunk children:',
        treeState.value.trunk.children.length
      );

      // This should pass if mutate works correctly
      expect(treeState.value.trunk.children.length).toBe(1);
      expect(treeState.value.trunk.children[0]).toEqual(testChild);
    });

    it('should test the exact generateBranchesRecursively mutate call', () => {
      // Create trunk using the real method
      treeState.acts.generateTreeInStore({ ...testConfig, maxGenerations: 0 });
      const trunk = treeState.value.trunk;

      console.log('Generated trunk:', trunk.id);
      console.log('Initial children count:', trunk.children.length);

      // Create a test child exactly like ForestBranch would
      const testChild: Branch = {
        id: 'trunk-0',
        relativePosition: { x: 10, y: -50 },
        absolutePosition: { x: 410, y: 117 },
        angle: -Math.PI / 3,
        thickness: 12,
        length: 70,
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

      // Use the EXACT mutate call from generateBranchesRecursively
      console.log('Before mutate call...');
      const updatedState = treeState.acts.mutate((draft) => {
        console.log('=== INSIDE MUTATE ===');
        console.log('draft.trunk exists:', !!draft.trunk);
        console.log('draft.trunk.id:', draft.trunk?.id);
        console.log('parent.id we are looking for:', trunk.id);

        // Find the parent in the draft tree and add the new branch
        const findAndUpdateParent = (branch: Branch): boolean => {
          console.log('Searching in branch:', branch.id);
          if (branch.id === trunk.id) {
            console.log('FOUND PARENT! Adding child...');
            console.log('Before push:', branch.children.length);
            branch.children.push(testChild);
            console.log('After push:', branch.children.length);
            return true;
          }
          return branch.children.some((child) => findAndUpdateParent(child));
        };

        if (draft.trunk) {
          const result = findAndUpdateParent(draft.trunk);
          console.log('findAndUpdateParent result:', result);
        } else {
          console.log('ERROR: draft.trunk is null/undefined!');
        }
        console.log('=== END MUTATE ===');
      });

      console.log('After mutate:');
      console.log('- updatedState.trunk.children.length:', updatedState.trunk.children.length);
      console.log(
        '- treeState.value.trunk.children.length:',
        treeState.value.trunk.children.length
      );

      // This is the failing assertion from the real tests
      expect(treeState.value.trunk.children.length).toBe(1);
    });

    it('should test if the issue is with the mutate method itself', () => {
      // Set up a simple state
      treeState.set('trunk', {
        id: 'trunk',
        children: [],
        // ... other properties
      } as Branch);

      console.log('Before mutate - simple test');
      console.log('trunk.children.length:', treeState.value.trunk.children.length);

      // Test a simple mutate operation
      const result = treeState.acts.mutate((draft) => {
        console.log('In mutate - draft.trunk.children.length:', draft.trunk.children.length);
        draft.trunk.children.push({ id: 'test-child' } as Branch);
        console.log('In mutate - after push:', draft.trunk.children.length);
      });

      console.log('After mutate - simple test');
      console.log('result.trunk.children.length:', result.trunk.children.length);
      console.log('treeState.value.trunk.children.length:', treeState.value.trunk.children.length);

      expect(treeState.value.trunk.children.length).toBe(1);
    });

    it('should test if the issue is with object references', () => {
      // Create trunk
      treeState.acts.generateTreeInStore({ ...testConfig, maxGenerations: 0 });
      const originalTrunk = treeState.value.trunk;

      console.log('Original trunk reference:', originalTrunk === treeState.value.trunk);
      console.log('Original trunk children:', originalTrunk.children.length);

      // Test mutate with the actual trunk reference
      treeState.acts.mutate((draft) => {
        console.log('draft.trunk === originalTrunk:', draft.trunk === originalTrunk);
        console.log('draft.trunk.id === originalTrunk.id:', draft.trunk.id === originalTrunk.id);

        if (draft.trunk.id === originalTrunk.id) {
          draft.trunk.children.push({ id: 'test' } as Branch);
        }
      });

      console.log('After mutate with reference check:');
      console.log('trunk.children.length:', treeState.value.trunk.children.length);

      expect(treeState.value.trunk.children.length).toBe(1);
    });

    it('should test the actual ForestBranch creation in generateBranchesRecursively', async () => {
      // Create trunk using the real method
      treeState.acts.generateTreeInStore({ ...testConfig, maxGenerations: 0 });
      const trunk = treeState.value.trunk;

      console.log('=== TESTING REAL FORESTBRANCH CREATION ===');
      console.log('Trunk:', trunk.id, 'children:', trunk.children.length);

      // Simulate the exact ForestBranch creation from generateBranchesRecursively
      const { createForestBranch } = await import('../state/createForestBranch');
      const branchPath = `${trunk.id}-child-0`;
      const branchForest = createForestBranch(treeState, branchPath);

      console.log('Created ForestBranch for path:', branchPath);

      // Call initializeBranch exactly like in the real code
      const newBranch = branchForest.acts.initializeBranch(trunk, 0, 2, testConfig, 0);

      console.log('ForestBranch created newBranch:', !!newBranch);
      console.log('newBranch.id:', newBranch?.id);
      console.log('newBranch.absolutePosition:', !!newBranch?.absolutePosition);

      // Verify the branch was created properly (same check as real code)
      if (!newBranch || !newBranch.absolutePosition) {
        console.error('Failed to create valid branch:', newBranch);
        expect(newBranch).toBeDefined();
        expect(newBranch.absolutePosition).toBeDefined();
        return;
      }

      console.log('Branch validation passed, calling mutate...');

      // Use the exact mutate call from the real code
      const updatedState = treeState.acts.mutate((draft) => {
        console.log('=== REAL MUTATE CALL ===');
        console.log('draft.trunk exists:', !!draft.trunk);
        console.log('parent.id:', trunk.id);
        console.log('newBranch.id:', newBranch.id);

        // Find the parent in the draft tree and add the new branch
        const findAndUpdateParent = (branch: Branch): boolean => {
          console.log('Checking branch:', branch.id, 'vs parent:', trunk.id);
          if (branch.id === trunk.id) {
            console.log('FOUND PARENT! Adding newBranch...');
            console.log('Before push:', branch.children.length);
            branch.children.push(newBranch);
            console.log('After push:', branch.children.length);
            return true;
          }
          return branch.children.some((child) => findAndUpdateParent(child));
        };

        if (draft.trunk) {
          const result = findAndUpdateParent(draft.trunk);
          console.log('findAndUpdateParent result:', result);
        }
        console.log('=== END REAL MUTATE ===');
      });

      console.log('Final result:');
      console.log('- updatedState.trunk.children.length:', updatedState.trunk.children.length);
      console.log(
        '- treeState.value.trunk.children.length:',
        treeState.value.trunk.children.length
      );

      // This should work if the real ForestBranch integration works
      expect(treeState.value.trunk.children.length).toBe(1);
      expect(treeState.value.trunk.children[0].id).toBe(newBranch.id);
    });
  });
});
