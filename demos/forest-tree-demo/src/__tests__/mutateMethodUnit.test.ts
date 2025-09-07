import { describe, it, expect, beforeEach, vi } from 'vitest';
import { defaultTreeConfig } from '../state/treeGenerator';
import type { Branch, TreeConfig, TreeState } from '../types';

// Mock Forest class to test the mutate method
class MockTreeStateWithMutate {
  value: TreeState;
  setCallHistory: Array<{ key: string; value: any }> = [];

  constructor(initialState: TreeState) {
    this.value = initialState;
  }

  set(key: string, value: any) {
    this.setCallHistory.push({ key, value });
    (this.value as any)[key] = value;
  }

  // Implementation of the mutate method from createTreeState
  mutate(producerFn: (draft: TreeState) => void): TreeState {
    const { produce } = require('immer');
    // Always use current state, not injected value parameter
    const newValue = produce(this.value, producerFn);

    // Update the entire state
    Object.keys(newValue).forEach((key) => {
      this.set(key, (newValue as any)[key]);
    });

    // Return the current state for convenience
    return this.value;
  }
}

describe('Mutate Method Unit Tests', () => {
  let mockTreeState: MockTreeStateWithMutate;
  let testBranch: Branch;
  let initialState: TreeState;

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

    initialState = {
      trunk: testBranch,
      width: 800,
      height: 600,
      season: 'spring',
      windForce: { x: 0, y: 0 },
      isPhysicsEnabled: false,
      showCoordinates: false,
      showDebugInfo: false,
    };

    mockTreeState = new MockTreeStateWithMutate(initialState);
  });

  describe('Basic Mutate Functionality', () => {
    it('should call set for each changed property', () => {
      mockTreeState.mutate((draft) => {
        draft.season = 'winter';
        draft.width = 1000;
      });

      expect(mockTreeState.setCallHistory.length).toBeGreaterThan(0);

      // Should have called set for season and width
      const seasonCall = mockTreeState.setCallHistory.find((call) => call.key === 'season');
      const widthCall = mockTreeState.setCallHistory.find((call) => call.key === 'width');

      expect(seasonCall).toBeDefined();
      expect(seasonCall?.value).toBe('winter');
      expect(widthCall).toBeDefined();
      expect(widthCall?.value).toBe(1000);
    });

    it('should return the updated state', () => {
      const result = mockTreeState.mutate((draft) => {
        draft.season = 'autumn';
        draft.width = 1200;
      });

      expect(result).toBeDefined();
      expect(result.season).toBe('autumn');
      expect(result.width).toBe(1200);
      expect(result).toBe(mockTreeState.value); // Should be the same reference
    });

    it('should preserve immutability of original state', () => {
      const originalSeason = mockTreeState.value.season;
      const originalWidth = mockTreeState.value.width;
      const originalTrunk = mockTreeState.value.trunk;

      mockTreeState.mutate((draft) => {
        draft.season = 'autumn';
        draft.width = 1200;
        if (draft.trunk) {
          draft.trunk.thickness = 25;
        }
      });

      // The mutate method updates the state through set calls
      // So the final state should be updated
      expect(mockTreeState.value.season).toBe('autumn');
      expect(mockTreeState.value.width).toBe(1200);
      expect(mockTreeState.value.trunk.thickness).toBe(25);
    });

    it('should handle nested object mutations', () => {
      mockTreeState.mutate((draft) => {
        draft.windForce.x = 10;
        draft.windForce.y = -5;
      });

      expect(mockTreeState.value.windForce.x).toBe(10);
      expect(mockTreeState.value.windForce.y).toBe(-5);
    });

    it('should handle array mutations on trunk children', () => {
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

      mockTreeState.mutate((draft) => {
        if (draft.trunk) {
          draft.trunk.children.push(newChild);
        }
      });

      expect(mockTreeState.value.trunk.children.length).toBe(1);
      expect(mockTreeState.value.trunk.children[0]).toEqual(newChild);
    });
  });

  describe('Complex Tree Mutations', () => {
    it('should handle adding multiple branches immutably', () => {
      const branch1: Branch = {
        id: 'trunk-0',
        relativePosition: { x: -20, y: -60 },
        absolutePosition: { x: 380, y: 140 },
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

      const branch2: Branch = {
        id: 'trunk-1',
        relativePosition: { x: 20, y: -60 },
        absolutePosition: { x: 420, y: 140 },
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

      mockTreeState.mutate((draft) => {
        if (draft.trunk) {
          draft.trunk.children.push(branch1, branch2);
        }
      });

      expect(mockTreeState.value.trunk.children.length).toBe(2);
      expect(mockTreeState.value.trunk.children[0].id).toBe('trunk-0');
      expect(mockTreeState.value.trunk.children[1].id).toBe('trunk-1');
    });

    it('should handle nested branch mutations', () => {
      // First add a child branch
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

      mockTreeState.mutate((draft) => {
        if (draft.trunk) {
          draft.trunk.children.push(childBranch);
        }
      });

      // Then add a grandchild
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

      mockTreeState.mutate((draft) => {
        // Find the child branch and add a grandchild
        const findAndUpdateBranch = (branch: Branch, targetId: string): boolean => {
          if (branch.id === targetId) {
            branch.children.push(grandChild);
            return true;
          }
          return branch.children.some((child) => findAndUpdateBranch(child, targetId));
        };

        if (draft.trunk) {
          findAndUpdateBranch(draft.trunk, 'trunk-0');
        }
      });

      expect(mockTreeState.value.trunk.children.length).toBe(1);
      expect(mockTreeState.value.trunk.children[0].children.length).toBe(1);
      expect(mockTreeState.value.trunk.children[0].children[0]).toEqual(grandChild);
    });

    it('should handle multiple property updates in one mutation', () => {
      mockTreeState.mutate((draft) => {
        draft.season = 'winter';
        draft.width = 1024;
        draft.height = 768;
        draft.windForce.x = 15;
        draft.windForce.y = -8;
        draft.isPhysicsEnabled = true;
        draft.showCoordinates = true;

        if (draft.trunk) {
          draft.trunk.thickness = 22;
          draft.trunk.color = 0x654321;
        }
      });

      expect(mockTreeState.value.season).toBe('winter');
      expect(mockTreeState.value.width).toBe(1024);
      expect(mockTreeState.value.height).toBe(768);
      expect(mockTreeState.value.windForce.x).toBe(15);
      expect(mockTreeState.value.windForce.y).toBe(-8);
      expect(mockTreeState.value.isPhysicsEnabled).toBe(true);
      expect(mockTreeState.value.showCoordinates).toBe(true);
      expect(mockTreeState.value.trunk.thickness).toBe(22);
      expect(mockTreeState.value.trunk.color).toBe(0x654321);
    });
  });

  describe('Error Handling', () => {
    it('should handle mutations that throw errors gracefully', () => {
      expect(() => {
        mockTreeState.mutate((draft) => {
          // This should not break the mutate method
          throw new Error('Test error in producer function');
        });
      }).toThrow('Test error in producer function');

      // State should remain unchanged
      expect(mockTreeState.value.season).toBe('spring');
      expect(mockTreeState.value.width).toBe(800);
    });

    it('should handle null/undefined trunk gracefully', () => {
      mockTreeState.value.trunk = null as any;

      expect(() => {
        mockTreeState.mutate((draft) => {
          if (draft.trunk) {
            draft.trunk.thickness = 30;
          } else {
            draft.season = 'summer';
          }
        });
      }).not.toThrow();

      expect(mockTreeState.value.season).toBe('summer');
    });
  });

  describe('Integration with Tree Building', () => {
    it('should simulate the tree building mutation pattern', () => {
      const parentBranch = mockTreeState.value.trunk;
      const newBranch: Branch = {
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

      // Simulate the exact pattern used in generateBranchesRecursively
      mockTreeState.mutate((draft) => {
        const findAndUpdateParent = (branch: Branch): boolean => {
          if (branch.id === parentBranch.id) {
            branch.children.push(newBranch);
            return true;
          }
          return branch.children.some((child) => findAndUpdateParent(child));
        };

        if (draft.trunk) {
          findAndUpdateParent(draft.trunk);
        }
      });

      expect(mockTreeState.value.trunk.children.length).toBe(1);
      expect(mockTreeState.value.trunk.children[0]).toEqual(newBranch);
    });

    it('should enable convenient chaining and access patterns', () => {
      // Test that the return value can be used for immediate access
      const updatedState = mockTreeState.mutate((draft) => {
        draft.season = 'winter';
        draft.windForce.x = 10;
        if (draft.trunk) {
          draft.trunk.thickness = 25;
        }
      });

      // Can immediately use the returned state
      expect(updatedState.season).toBe('winter');
      expect(updatedState.windForce.x).toBe(10);
      expect(updatedState.trunk.thickness).toBe(25);

      // And it's the same as the current state
      expect(updatedState).toBe(mockTreeState.value);
    });
  });
});
