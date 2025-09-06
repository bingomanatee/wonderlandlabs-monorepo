import * as PIXI from 'pixi.js';
import chroma from 'chroma-js';
import { Vector } from 'matter-js';
import type { Branch, Point } from '../types';

import type { StoreIF } from '@wonderlandlabs/forestry4';

// Vector lerp utility using Matter.js operations
const vectorLerp = (a: Point, b: Point, t: number): Point => {
  const scaledA = Vector.mult(Vector.clone(a), 1 - t);
  const scaledB = Vector.mult(Vector.clone(b), t);
  return Vector.add(scaledA, scaledB);
};

// Get seasonal background colors for PIXI
function getSeasonalBackgroundColor(season: string): number {
  switch (season) {
    case 'spring':
      return 0x87ceeb; // Sky blue
    case 'summer':
      return 0x87ceeb; // Sky blue
    case 'autumn':
    case 'fall':
      return 0xffa500; // Orange
    case 'winter':
      return 0x708090; // Slate gray
    default:
      return 0x87ceeb; // Default sky blue
  }
}

// Draw a single branch with wind effects
export function drawBranch(graphics: PIXI.Graphics, branch: Branch, parentWindEndPoint?: Point) {
  if (!graphics) return;

  // Calculate wind offset for this branch
  const windOffset = calculateWindOffset(branch);

  // Start point (base of branch)
  const startPoint = parentWindEndPoint || branch.absolutePosition;

  // End point calculation - use branch length and angle
  const baseEndPoint = {
    x: startPoint.x + Math.cos(branch.angle) * branch.length,
    y: startPoint.y + Math.sin(branch.angle) * branch.length,
  };

  const windEndPoint = {
    x: baseEndPoint.x + windOffset.x,
    y: baseEndPoint.y + windOffset.y,
  };

  // Only render non-leaf branches (thickness > 0)
  if (branch.thickness > 0) {
    graphics.setStrokeStyle({ color: branch.color, width: branch.thickness });
    graphics.moveTo(startPoint.x, startPoint.y);
    graphics.lineTo(windEndPoint.x, windEndPoint.y);
    graphics.stroke();
  }

  // Recursively draw child branches (including leaves)
  if (branch.children) {
    branch.children.forEach((child) => {
      drawBranch(graphics, child, windEndPoint);
    });
  }
}

// Draw leaves separately to ensure they're on top
export function drawLeafBranches(graphics: PIXI.Graphics, branch: Branch, parentWindEndPoint?: Point) {
  if (!graphics) return;

  // Calculate wind offset for this branch
  const windOffset = calculateWindOffset(branch);

  // Start point (base of branch)
  const startPoint = parentWindEndPoint || branch.absolutePosition;

  // End point calculation - use branch length and angle
  const baseEndPoint = {
    x: startPoint.x + Math.cos(branch.angle) * branch.length,
    y: startPoint.y + Math.sin(branch.angle) * branch.length,
  };

  const windEndPoint = {
    x: baseEndPoint.x + windOffset.x,
    y: baseEndPoint.y + windOffset.y,
  };

  // Only render leaf branches (thickness 0)
  if (branch.thickness === 0) {
    graphics.setFillStyle({ color: branch.color });
    graphics.circle(windEndPoint.x, windEndPoint.y, branch.length);
    graphics.fill();
  }

  // Recursively draw child leaf branches
  if (branch.children) {
    branch.children.forEach((child) => {
      drawLeafBranches(graphics, child, windEndPoint);
    });
  }
}

// Calculate wind offset for a branch
function calculateWindOffset(branch: Branch): Point {
  if (!branch.children || branch.children.length === 0) {
    // Leaf branch - direct wind effect with exponential falloff by generation
    const generationFalloff = Math.exp(-branch.generation * 0.3); // Exponential decay by generation
    const baseWindMultiplier = 4.0; // Doubled base multiplier for more movement
    const windMultiplier = baseWindMultiplier * generationFalloff;

    return {
      x: 0 * windMultiplier, // No global wind force in this context
      y: 0 * windMultiplier,
    };
  } else {
    // Non-leaf branch - average of children's wind effects with reduced influence
    const childOffsets = branch.children.map((child) => calculateWindOffset(child));
    const avgOffset = childOffsets.reduce(
      (sum, offset) => ({
        x: sum.x + offset.x,
        y: sum.y + offset.y,
      }),
      { x: 0, y: 0 }
    );

    const childCount = childOffsets.length;
    const branchWindMultiplier = 0.3; // Reduced influence for non-leaf branches

    return {
      x: (avgOffset.x / childCount) * branchWindMultiplier,
      y: (avgOffset.y / childCount) * branchWindMultiplier,
    };
  }
}

// Draw leaves for a branch (legacy - leaves are now branches)
function drawLeaves(graphics: PIXI.Graphics, branch: Branch, position: Point) {
  if (!branch.leaves || branch.leaves.length === 0) return;

  branch.leaves.forEach((leaf) => {
    // Use leaf's absolute position directly
    const leafPosition = leaf.position;

    // Draw leaf as small circle - convert string color to number if needed
    const leafColor =
      typeof leaf.color === 'string' ? parseInt(leaf.color.replace('#', ''), 16) : leaf.color;
    graphics.setFillStyle({ color: leafColor });
    graphics.circle(leafPosition.x, leafPosition.y, leaf.size);
    graphics.fill();
  });
}

// Create branch containers for interactive elements
export function createBranchContainers(branch: Branch, parentContainer: PIXI.Container) {
  // Create container for this branch
  const container = new PIXI.Container();
  container.name = branch.id; // Name container with branch ID
  container.position.set(0, 0);
  parentContainer.addChild(container);

  // Create graphics for this branch
  const graphics = new PIXI.Graphics();
  container.addChild(graphics);

  // Store branch data in container for easy access
  (container as any).branchData = branch;

  // Recursively create containers for child branches
  if (branch.children) {
    branch.children.forEach((child) => {
      createBranchContainers(child, container);
    });
  }
}

// Update wind positions for branch containers
export function updateBranchWindPosition(branch: Branch, treeGraphics: PIXI.Container) {
  if (!treeGraphics) return;

  // Find container by branch ID
  const container = treeGraphics.getChildByName(branch.id) as PIXI.Container;
  if (!container) return;

  // Calculate wind offset
  const windOffset = calculateWindOffset(branch);

  // Update container position with wind effect
  container.position.set(
    branch.absolutePosition.x + windOffset.x,
    branch.absolutePosition.y + windOffset.y
  );

  // Recursively update child branches
  if (branch.children) {
    branch.children.forEach((child) => {
      updateBranchWindPosition(child, treeGraphics);
    });
  }
}

// Render coordinate validation grid
export function renderCoordinateValidation(
  coordGraphics: PIXI.Graphics,
  pixiApp: PIXI.Application
) {
  if (!coordGraphics || !pixiApp) return;

  coordGraphics.clear();

  // Draw coordinate grid
  const gridSize = 50;
  const width = pixiApp.screen.width;
  const height = pixiApp.screen.height;

  coordGraphics.setStrokeStyle({ color: 0x333333, width: 1, alpha: 0.3 });

  // Vertical lines
  for (let x = 0; x <= width; x += gridSize) {
    coordGraphics.moveTo(x, 0);
    coordGraphics.lineTo(x, height);
  }

  // Horizontal lines
  for (let y = 0; y <= height; y += gridSize) {
    coordGraphics.moveTo(0, y);
    coordGraphics.lineTo(width, y);
  }

  coordGraphics.stroke();
}

// Render background with mountains and ground
export function renderBackground(
  backgroundGraphics: PIXI.Graphics,
  pixiApp: PIXI.Application,
  season: string
) {
  if (!backgroundGraphics || !pixiApp) return;

  backgroundGraphics.clear();

  const width = pixiApp.screen.width;
  const height = pixiApp.screen.height;

  // Sky gradient
  const skyColor = getSeasonalBackgroundColor(season);
  backgroundGraphics.setFillStyle({ color: skyColor });
  backgroundGraphics.rect(0, 0, width, height);
  backgroundGraphics.fill();

  // Mountains
  const mountainColor = 0x8b7355; // Brown mountains
  backgroundGraphics.setFillStyle({ color: mountainColor });

  // Draw mountain silhouette
  backgroundGraphics.moveTo(0, height * 0.6);
  for (let x = 0; x <= width; x += 20) {
    const mountainHeight = Math.sin(x * 0.01) * 100 + Math.sin(x * 0.03) * 50;
    backgroundGraphics.lineTo(x, height * 0.6 - mountainHeight);
  }
  backgroundGraphics.lineTo(width, height);
  backgroundGraphics.lineTo(0, height);
  backgroundGraphics.fill();

  // Ground
  const groundColor = 0x8fbc8f; // Dark sea green
  backgroundGraphics.setFillStyle({ color: groundColor });
  backgroundGraphics.rect(0, height - 50, width, 50);
  backgroundGraphics.fill();
}

export async function makePixi(container: HTMLElement): PIXI.Application {
  const containerRect = container.getBoundingClientRect();
  const containerWidth = containerRect.width;
  const containerHeight = containerRect.height;

  // Create Pixi app with container dimensions (v8 API)
  const pixiApp = new PIXI.Application();
  await pixiApp.init({
    width: containerWidth,
    height: containerHeight,
    backgroundColor: 0x87ceeb,
    antialias: true,
    autoDensity: true,
    resizeTo: container, // Auto-resize to container
    resolution: window.devicePixelRatio || 1, // Handle high DPI displays
  });
  return pixiApp;
}

export function createContainers(state: StoreIF, pixiApp: PIXI.Application) {
  // 1. Background graphics (mountains and ground) - back layer
  const backgroundGraphics = new PIXI.Graphics();
  backgroundGraphics.position.set(0, 0);
  pixiApp.stage.addChild(backgroundGraphics);
  state.res.set('backgroundGraphics', backgroundGraphics);

  // 2. Tree graphics - front layer
  const treeGraphics = new PIXI.Graphics();
  treeGraphics.position.set(0, 0);
  pixiApp.stage.addChild(treeGraphics);
  state.res.set('treeGraphics', treeGraphics);

  // 3. Coordinate validation graphics (debug layer) - top layer
  const coordGraphics = new PIXI.Graphics();
  coordGraphics.position.set(0, 0);
  pixiApp.stage.addChild(coordGraphics);
  state.res.set('coordGraphics', coordGraphics);

  return { coordGraphics, treeGraphics, backgroundGraphics };
}

// Render complete tree
export function renderTree(graphics: PIXI.Graphics, coordGraphics: PIXI.Graphics, trunk: Branch) {
  if (!graphics || !coordGraphics) return;

  graphics.clear();
  coordGraphics.clear();

  // Draw branches first (bottom layer)
  drawBranch(graphics, trunk);

  // Draw leaves on top (top layer)
  drawLeafBranches(graphics, trunk);
}

// Utility method to create seasonal color palettes
export function createSeasonalPalette(season: string): number[] {
  const baseBrown = 0x8b4513; // Saddle brown

  switch (season) {
    case 'spring':
      return [
        baseBrown,
        parseInt(chroma(baseBrown).brighten(0.5).hex().replace('#', ''), 16),
        parseInt(chroma(baseBrown).set('hsl.h', 30).hex().replace('#', ''), 16), // More orange
      ];
    case 'summer':
      return [
        baseBrown,
        parseInt(chroma(baseBrown).darken(0.3).hex().replace('#', ''), 16),
        parseInt(chroma(baseBrown).set('hsl.h', 25).hex().replace('#', ''), 16), // Warmer brown
      ];
    case 'autumn':
    case 'fall':
      return [
        baseBrown,
        parseInt(chroma(baseBrown).set('hsl.h', 15).saturate(0.5).hex().replace('#', ''), 16), // Reddish brown
        parseInt(chroma(baseBrown).set('hsl.h', 35).brighten(0.2).hex().replace('#', ''), 16), // Golden brown
      ];
    case 'winter':
      return [
        baseBrown,
        parseInt(chroma(baseBrown).desaturate(0.3).darken(0.2).hex().replace('#', ''), 16), // Greyish brown
        parseInt(chroma(baseBrown).set('hsl.h', 220).desaturate(0.5).hex().replace('#', ''), 16), // Cool brown
      ];
    default:
      return [baseBrown];
  }
}
