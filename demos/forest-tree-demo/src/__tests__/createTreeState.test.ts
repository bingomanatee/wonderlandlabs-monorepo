import { beforeEach, describe, expect, test, vi } from 'vitest';
import { setupPixiMocks, MockApplication, MockGraphics } from './mocks/pixiMock';
import { createTreeState } from '../state/createTreeState';
import { defaultTreeConfig } from '../state/treeGenerator.ts';

// Setup mocks before tests
setupPixiMocks();

describe('Tree State Creation', () => {
  let mockContainer: HTMLDivElement;
  let mockApp: MockApplication;

  beforeEach(() => {
    // Create mock DOM container
    mockContainer = {
      clientWidth: 800,
      clientHeight: 600,
      appendChild: vi.fn(),
      removeChild: vi.fn(),
    } as any;

    // Create mock PIXI app
    mockApp = new MockApplication();

    // Mock PIXI.Application constructor
    vi.doMock('pixi.js', () => ({
      Application: vi.fn(() => mockApp),
      Container: (global as any).PIXI.Container,
      Graphics: (global as any).PIXI.Graphics,
    }));
  });

  test('should create tree state with valid structure', async () => {
    const config = {
      ...defaultTreeConfig,
      maxGenerations: 2,
      branchCount: 2,
    };

    const treeState = createTreeState(config);

    // Check initial state
    expect(treeState.value.trunk).toBeDefined();
    expect(treeState.value.trunk.id).toBe('trunk');
    expect(treeState.value.trunk.generation).toBe(0);
    expect(treeState.value.windForce).toEqual({ x: 0, y: 0 });
    expect(treeState.value.season).toBe('spring');
    expect(treeState.value.mousePosition).toEqual({ x: 0, y: 0 });
  });

  test('should have proper tree hierarchy', () => {
    const config = {
      ...defaultTreeConfig,
      maxGenerations: 3,
      branchCount: 2,
    };

    const treeState = createTreeState(config);
    const trunk = treeState.value.trunk;

    // Validate trunk
    expect(trunk.relativePosition).toEqual({ x: 0, y: 0 });
    expect(trunk.absolutePosition).toBeDefined();
    expect(trunk.angle).toBeCloseTo(-Math.PI / 2);
    expect(trunk.children).toBeDefined();
    expect(Array.isArray(trunk.children)).toBe(true);

    // Check children have proper relative coordinates
    if (trunk.children.length > 0) {
      const firstChild = trunk.children[0];
      expect(firstChild.relativePosition).toBeDefined();
      expect(firstChild.absolutePosition).toBeDefined();
      expect(firstChild.angle).toBeDefined();
      expect(firstChild.generation).toBe(1);
    }
  });

  test('should calculate wind offset correctly', () => {
    const config = {
      ...defaultTreeConfig,
      maxGenerations: 2,
      branchCount: 1,
    };

    const treeState = createTreeState(config);

    // Set some wind force
    treeState.set('windForce', { x: 10, y: 5 });

    const trunk = treeState.value.trunk;
    if (trunk.children.length > 0) {
      const child = trunk.children[0];

      // Test wind offset calculation
      const windOffset = treeState.acts.calculateWindOffset(child);
      expect(windOffset).toBeDefined();
      expect(typeof windOffset.x).toBe('number');
      expect(typeof windOffset.y).toBe('number');
    }
  });

  test('should find closest leaf correctly', () => {
    const config = {
      ...defaultTreeConfig,
      maxGenerations: 3,
      branchCount: 2,
    };

    const treeState = createTreeState(config);
    const trunk = treeState.value.trunk;

    if (trunk.children.length > 0) {
      const firstBranch = trunk.children[0];
      const closestLeaf = treeState.acts.findClosestLeaf(firstBranch);

      if (closestLeaf) {
        expect(closestLeaf).toBeDefined();
        expect(closestLeaf.children.length).toBe(0); // Should be a leaf
        expect(closestLeaf.absolutePosition).toBeDefined();
      }
    }
  });

  test('should handle seasonal changes', () => {
    const treeState = createTreeState(defaultTreeConfig);

    // Test seasonal background
    const springBg = treeState.acts.getSeasonalBackground();
    expect(springBg).toContain('gradient');

    // Change season - create mock event
    const mockEvent = {
      currentTarget: {
        dataset: {
          season: 'winter',
        },
      },
    } as React.MouseEvent<HTMLButtonElement>;

    treeState.acts.setSeason(mockEvent);
    expect(treeState.value.season).toBe('winter');

    const winterBg = treeState.acts.getSeasonalBackground();
    expect(winterBg).toContain('gradient');
    expect(winterBg).not.toBe(springBg);
  });

  test('should update wind force correctly', () => {
    const treeState = createTreeState(defaultTreeConfig);

    // Test wind update
    treeState.acts.setMousePosition(500, 400);
    treeState.acts.updateWindToward();

    const windForce = treeState.value.windForce;
    expect(windForce).toBeDefined();
    expect(typeof windForce.x).toBe('number');
    expect(typeof windForce.y).toBe('number');
  });

  test('should handle mouse position updates', () => {
    const treeState = createTreeState(defaultTreeConfig);

    treeState.acts.setMousePosition(100, 200);
    expect(treeState.value.mousePosition).toEqual({ x: 100, y: 200 });

    treeState.acts.setMousePosition(300, 400);
    expect(treeState.value.mousePosition).toEqual({ x: 300, y: 400 });
  });

  test('should validate branch structure recursively', () => {
    const config = {
      ...defaultTreeConfig,
      maxGenerations: 3,
      branchCount: 2,
    };

    const treeState = createTreeState(config);

    const validateBranch = (branch: any, expectedGeneration: number) => {
      expect(branch.id).toBeDefined();
      expect(branch.generation).toBe(expectedGeneration);
      expect(branch.relativePosition).toBeDefined();
      expect(branch.absolutePosition).toBeDefined();
      expect(branch.angle).toBeDefined();
      expect(branch.thickness).toBeGreaterThan(0);
      expect(branch.length).toBeGreaterThan(0);
      expect(branch.color).toBeDefined();

      if (branch.children && branch.children.length > 0) {
        branch.children.forEach((child: any) => {
          validateBranch(child, expectedGeneration + 1);
        });
      }
    };

    validateBranch(treeState.value.trunk, 0);
  });
});
