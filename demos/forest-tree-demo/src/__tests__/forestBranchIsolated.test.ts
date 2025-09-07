import { describe, it, expect, beforeEach } from 'vitest';
import { defaultTreeConfig } from '../state/treeGenerator';
import type { Branch, TreeConfig } from '../types';

// Create a minimal mock of the Forest class that mimics the actual behavior
class MockForest {
  value: any = null;
  acts: any = {};
  
  constructor(config: any) {
    this.value = config.value;
    this.acts = config.actions || {};
    
    // Bind actions to this instance
    Object.keys(this.acts).forEach(key => {
      const originalAction = this.acts[key];
      this.acts[key] = (...args: any[]) => {
        return originalAction.call(this, this.value, ...args);
      };
    });
  }
  
  set(key: string, value: any) {
    if (key === '') {
      this.value = value;
    }
  }
  
  branch(path: string, config: any) {
    return new MockForest(config);
  }
}

// Mock the main state for generateBranchesRecursively
const mockMainState = {
  acts: {
    generateBranchesRecursively: (parent: Branch, config: TreeConfig, generation: number) => {
      // This is where the recursive call happens - simulate it
      console.log(`Mock generateBranchesRecursively called with parent ID: ${parent?.id}, generation: ${generation}`);
      
      if (!parent || !parent.absolutePosition) {
        throw new Error(`generateBranchesRecursively received invalid parent: ${parent?.id || 'unknown'}`);
      }
      
      // Simulate successful recursive call
      return;
    }
  }
};

// Simulate the createForestBranch function logic
function createMockForestBranch(state: any, branchPath: string) {
  return new MockForest({
    value: null as Branch | null,
    actions: {
      initializeBranch(branchValue: any, parentBranch: Branch, index: number, total: number, config: TreeConfig, generation: number) {
        const branchState = this as any;
        const newBranch = branchState.acts.createBranchData(parentBranch, index, total, config, generation);
        branchState.set('', newBranch);
        return newBranch;
      },

      addToParent(branchValue: any, parentBranch: Branch) {
        if (branchValue) {
          parentBranch.children.push(branchValue);
        }
      },

      generateChildren(branchValue: any, config: TreeConfig, generation: number) {
        if (branchValue && branchValue.absolutePosition) {
          state.acts.generateBranchesRecursively(branchValue, config, generation + 1);
        } else {
          console.warn('generateChildren called with invalid branchValue:', branchValue);
        }
      },

      calculateBranchCount(branchValue: any, parent: Branch, config: TreeConfig, generation: number): number {
        let baseBranches = generation === 0 ? 2 : 3;
        const variation = Math.floor(Math.random() * 3) - 1;
        return Math.max(1, baseBranches + variation);
      },

      createBranchData(branchValue: any, parent: Branch, index: number, numBranches: number, config: TreeConfig, generation: number): Branch {
        // Validate parent has required properties
        if (!parent) {
          throw new Error(`Invalid parent branch: parent is null/undefined`);
        }
        if (!parent.absolutePosition) {
          console.error('Parent branch structure:', parent);
          throw new Error(
            `Invalid parent branch: missing absolutePosition. Parent ID: ${parent.id || 'unknown'}`
          );
        }

        // Calculate angle using the same logic as treeGenerator
        let finalAngle;
        if (generation === 0) {
          const maxSpread = Math.PI / 3;
          const angleOffset = (index - (numBranches - 1) / 2) * (maxSpread / Math.max(1, numBranches - 1));
          finalAngle = -Math.PI / 2 + angleOffset + (Math.random() - 0.5) * 0.2;
        } else {
          const maxSpread = Math.PI / 3;
          const angleOffset = (index - (numBranches - 1) / 2) * (maxSpread / Math.max(1, numBranches - 1));
          finalAngle = parent.angle + angleOffset + (Math.random() - 0.5) * 0.3 - 0.1;
        }

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
      },

      generateBranchColor(branchValue: any, parentColor: number): number {
        return parentColor + Math.floor((Math.random() - 0.5) * 0x111111);
      },
    }
  });
}

describe('ForestBranch Isolated Integration Test', () => {
  let testConfig: TreeConfig;
  let validTrunk: Branch;

  beforeEach(() => {
    testConfig = {
      ...defaultTreeConfig,
      maxGenerations: 3,
      centerX: 400,
      centerY: 300,
    };

    // Create trunk exactly like in generateTreeInStore
    validTrunk = {
      id: 'trunk',
      relativePosition: { x: 0, y: -133 },
      absolutePosition: { x: 400, y: 167 }, // centerY - trunkLength
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
  });

  it('should create a single branch successfully', () => {
    const branchForest = createMockForestBranch(mockMainState, 'test-branch-0');
    
    expect(() => {
      const newBranch = branchForest.acts.initializeBranch(validTrunk, 0, 3, testConfig, 0);
      expect(newBranch).toBeDefined();
      expect(newBranch.absolutePosition).toBeDefined();
      expect(newBranch.id).toBe('trunk-0');
    }).not.toThrow();
  });

  it('should simulate the exact generateBranchesRecursively flow', () => {
    const generation = 0;
    const numBranches = 2;

    // This simulates the exact flow in generateBranchesRecursively
    for (let i = 0; i < numBranches; i++) {
      const branchPath = `${validTrunk.id}-child-${i}`;
      const branchForest = createMockForestBranch(mockMainState, branchPath);

      // Step 1: Initialize branch
      const newBranch = branchForest.acts.initializeBranch(validTrunk, i, numBranches, testConfig, generation);
      
      // Verify the branch was created correctly
      expect(newBranch).toBeDefined();
      expect(newBranch.absolutePosition).toBeDefined();
      expect(newBranch.absolutePosition.x).toBeTypeOf('number');
      expect(newBranch.absolutePosition.y).toBeTypeOf('number');
      expect(isFinite(newBranch.absolutePosition.x)).toBe(true);
      expect(isFinite(newBranch.absolutePosition.y)).toBe(true);

      // Step 2: Add to parent
      validTrunk.children.push(newBranch);

      // Step 3: Generate children - this is where the error occurs
      expect(() => {
        branchForest.acts.generateChildren(testConfig, generation);
      }).not.toThrow();
    }

    expect(validTrunk.children.length).toBe(numBranches);
  });

  it('should identify the exact point of failure', () => {
    const branchForest = createMockForestBranch(mockMainState, 'test-branch');
    
    // Create a branch
    const newBranch = branchForest.acts.initializeBranch(validTrunk, 0, 3, testConfig, 0);
    
    // Verify the branch is valid
    expect(newBranch.absolutePosition).toBeDefined();
    
    // Now test what happens when generateChildren is called
    // The branchForest.value should be the newBranch
    expect(branchForest.value).toBe(newBranch);
    expect(branchForest.value.absolutePosition).toBeDefined();
    
    // This should work
    expect(() => {
      branchForest.acts.generateChildren(testConfig, 0);
    }).not.toThrow();
  });

  it('should reproduce the exact error scenario', () => {
    // Test what happens if branchForest.value is null when generateChildren is called
    const branchForest = createMockForestBranch(mockMainState, 'test-branch');
    
    // Don't initialize the branch - leave branchForest.value as null
    expect(branchForest.value).toBeNull();
    
    // This should not throw because of the null check
    expect(() => {
      branchForest.acts.generateChildren(testConfig, 0);
    }).not.toThrow();
    
    // But if we somehow have a branch without absolutePosition
    branchForest.value = { id: 'invalid', children: [] }; // Missing absolutePosition
    
    // This should trigger the warning
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    branchForest.acts.generateChildren(testConfig, 0);
    expect(consoleSpy).toHaveBeenCalledWith('generateChildren called with invalid branchValue:', branchForest.value);
    consoleSpy.mockRestore();
  });

  it('should test the exact sequence that causes the error', () => {
    // Simulate the exact sequence from the stack trace:
    // 1. generateBranchesRecursively calls createForestBranch
    // 2. initializeBranch calls createBranchData
    // 3. createBranchData validates parent.absolutePosition
    
    const mockInvalidParent = {
      id: 'invalid-parent',
      // Missing absolutePosition!
      angle: -Math.PI / 2,
      thickness: 18,
      length: 133,
      children: [],
      leaves: [],
      generation: 0,
      level: 0,
      color: 0x8b4513,
    } as Branch;

    const branchForest = createMockForestBranch(mockMainState, 'test-branch');
    
    expect(() => {
      branchForest.acts.initializeBranch(mockInvalidParent, 0, 3, testConfig, 0);
    }).toThrow('Invalid parent branch: missing absolutePosition. Parent ID: invalid-parent');
  });
});
