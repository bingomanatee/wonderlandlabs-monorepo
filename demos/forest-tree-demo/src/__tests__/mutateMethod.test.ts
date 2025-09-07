import { describe, it, expect, beforeEach } from 'vitest';
import { defaultTreeConfig } from '../state/treeGenerator';
import type { Branch, TreeConfig, TreeState } from '../types';

describe('Mutate Method Tests', () => {
  let testState: TreeState;
  let testBranch: Branch;

  beforeEach(() => {
    testBranch = {
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

    testState = {
      trunk: testBranch,
      width: 800,
      height: 600,
      season: 'spring',
      windForce: { x: 0, y: 0 },
      isPhysicsEnabled: false,
      showCoordinates: false,
      showDebugInfo: false,
    };
  });

  describe('Immutable Updates', () => {
    it('should preserve immutability when adding children', () => {
      const originalState = { ...testState };
      const originalTrunk = { ...testState.trunk };
      const originalChildren = [...testState.trunk.children];

      // Simulate what the mutate method should do
      const { produce } = require('immer');
      
      const newChild: Branch = {
        id: 'trunk-0',
        relativePosition: { x: 10, y: -50 },
        absolutePosition: { x: 410, y: 150 },
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

      // Test immutable update using produce
      const newState = produce(testState, (draft: TreeState) => {
        if (draft.trunk) {
          draft.trunk.children.push(newChild);
        }
      });

      // Original state should be unchanged
      expect(testState.trunk.children.length).toBe(0);
      expect(testState.trunk.children).toEqual(originalChildren);
      expect(testState.trunk).toEqual(originalTrunk);

      // New state should have the child
      expect(newState.trunk.children.length).toBe(1);
      expect(newState.trunk.children[0]).toEqual(newChild);
      
      // But the trunk reference should be different (immutable)
      expect(newState.trunk).not.toBe(testState.trunk);
      expect(newState).not.toBe(testState);
    });

    it('should handle nested branch updates immutably', () => {
      // Create a tree with multiple levels
      const childBranch: Branch = {
        id: 'trunk-0',
        relativePosition: { x: 10, y: -50 },
        absolutePosition: { x: 410, y: 150 },
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

      testState.trunk.children.push(childBranch);

      const grandChild: Branch = {
        id: 'trunk-0-0',
        relativePosition: { x: 5, y: -30 },
        absolutePosition: { x: 415, y: 120 },
        angle: -Math.PI / 4,
        thickness: 8,
        length: 50,
        children: [],
        leaves: [],
        generation: 2,
        level: 0,
        color: 0x8b4513,
        branchCountOffset: 0,
        ancestralOffsetSum: 0,
        levelChangeOffset: 0,
        ancestralLevelSum: 0,
        velocity: { x: 0, y: 0 },
        force: { x: 0, y: 0 },
        springConstant: 0.02,
        mass: 25,
      };

      const { produce } = require('immer');

      // Test nested immutable update
      const newState = produce(testState, (draft: TreeState) => {
        // Find the child branch and add a grandchild
        const findAndUpdateBranch = (branch: Branch, targetId: string): boolean => {
          if (branch.id === targetId) {
            branch.children.push(grandChild);
            return true;
          }
          return branch.children.some(child => findAndUpdateBranch(child, targetId));
        };

        if (draft.trunk) {
          findAndUpdateBranch(draft.trunk, 'trunk-0');
        }
      });

      // Original state should be unchanged
      expect(testState.trunk.children[0].children.length).toBe(0);

      // New state should have the grandchild
      expect(newState.trunk.children[0].children.length).toBe(1);
      expect(newState.trunk.children[0].children[0]).toEqual(grandChild);

      // References should be different (immutable)
      expect(newState.trunk).not.toBe(testState.trunk);
      expect(newState.trunk.children[0]).not.toBe(testState.trunk.children[0]);
    });

    it('should handle multiple property updates immutably', () => {
      const { produce } = require('immer');

      const newState = produce(testState, (draft: TreeState) => {
        draft.season = 'winter';
        draft.windForce.x = 5;
        draft.windForce.y = -2;
        if (draft.trunk) {
          draft.trunk.thickness = 20;
          draft.trunk.color = 0x654321;
        }
      });

      // Original state should be unchanged
      expect(testState.season).toBe('spring');
      expect(testState.windForce.x).toBe(0);
      expect(testState.windForce.y).toBe(0);
      expect(testState.trunk.thickness).toBe(18);
      expect(testState.trunk.color).toBe(0x8b4513);

      // New state should have updates
      expect(newState.season).toBe('winter');
      expect(newState.windForce.x).toBe(5);
      expect(newState.windForce.y).toBe(-2);
      expect(newState.trunk.thickness).toBe(20);
      expect(newState.trunk.color).toBe(0x654321);

      // References should be different
      expect(newState).not.toBe(testState);
      expect(newState.windForce).not.toBe(testState.windForce);
      expect(newState.trunk).not.toBe(testState.trunk);
    });
  });

  describe('Tree Building with Immutability', () => {
    it('should simulate tree building with proper immutable updates', () => {
      const { produce } = require('immer');
      let currentState = testState;

      // Simulate adding multiple branches immutably
      const branches = [
        {
          id: 'trunk-0',
          parentId: 'trunk',
          relativePosition: { x: -20, y: -60 },
          absolutePosition: { x: 380, y: 140 },
        },
        {
          id: 'trunk-1',
          parentId: 'trunk',
          relativePosition: { x: 20, y: -60 },
          absolutePosition: { x: 420, y: 140 },
        },
      ];

      branches.forEach(branchData => {
        const newBranch: Branch = {
          id: branchData.id,
          relativePosition: branchData.relativePosition,
          absolutePosition: branchData.absolutePosition,
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

        currentState = produce(currentState, (draft: TreeState) => {
          const findAndUpdateParent = (branch: Branch, targetId: string): boolean => {
            if (branch.id === targetId) {
              branch.children.push(newBranch);
              return true;
            }
            return branch.children.some(child => findAndUpdateParent(child, targetId));
          };

          if (draft.trunk) {
            findAndUpdateParent(draft.trunk, branchData.parentId);
          }
        });
      });

      // Original state should be unchanged
      expect(testState.trunk.children.length).toBe(0);

      // Final state should have both branches
      expect(currentState.trunk.children.length).toBe(2);
      expect(currentState.trunk.children[0].id).toBe('trunk-0');
      expect(currentState.trunk.children[1].id).toBe('trunk-1');

      // All references should be different (immutable)
      expect(currentState).not.toBe(testState);
      expect(currentState.trunk).not.toBe(testState.trunk);
    });

    it('should validate that direct mutation breaks immutability', () => {
      const originalState = { ...testState };
      const originalTrunk = testState.trunk;

      // Direct mutation (what we want to avoid)
      const newChild: Branch = {
        id: 'trunk-0',
        relativePosition: { x: 10, y: -50 },
        absolutePosition: { x: 410, y: 150 },
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

      // This breaks immutability!
      testState.trunk.children.push(newChild);

      // The original reference is now mutated
      expect(testState.trunk).toBe(originalTrunk); // Same reference
      expect(testState.trunk.children.length).toBe(1); // But mutated content
      
      // This demonstrates why we need the mutate method with produce
    });
  });
});
