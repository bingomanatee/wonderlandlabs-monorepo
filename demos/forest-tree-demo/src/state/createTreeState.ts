import { Vector } from 'matter-js';
import * as PIXI from 'pixi.js';
import { produce } from 'immer';
import chroma from 'chroma-js';
import React from 'react';
import type { ActionExposedRecord } from '@wonderlandlabs/forestry4';
// import type { ActionExposedFn, ActionExposedRecord } from '@wonderlandlabs/forestry4';
import { Forest } from '@wonderlandlabs/forestry4';
import type { Branch, Point, TreeConfig, TreeState } from '../types';
import { defaultTreeConfig, generateTree, getSeasonalParams } from './treeGenerator.ts';
import { MatterTreePhysics } from '../matterTreePhysics';
import { createForestBranch } from './createForestBranch';
import * as Graphics from '../utils/graphics';
import { createContainers, makePixi, renderBackground, renderTree } from '../utils/graphics';

// Type interface for all tree state actions
export interface TreeStateActions extends ActionExposedRecord {
  initializePixi: ActionExposedFn<[container: HTMLDivElement], void>;

  cleanup(): void;

  setMousePosition(mouseX: number, mouseY: number): void;

  updateWindToward(): void;

  getSeasonalStrength(): number;

  tick(): void;

  setSeason(event: React.MouseEvent<HTMLButtonElement>): void;

  getSeasonalBackground(): string;

  findClosestLeaf(branch: Branch): Branch | null;

  updateForceParams(params: Partial<TreeState['forceParams']>): void;

  toggleForceAnimation(): void;

  stepForceSimulation(): void;

  dumpTreeJSON(): void;

  changeSeason(season: 'spring' | 'summer' | 'autumn' | 'fall' | 'winter'): void;

  updateLeafColorsImmutable(branch: Branch, season: string): Branch;

  generateTreeInStore(config: TreeConfig): void;

  generateBranchesRecursively(parent: Branch, config: TreeConfig, generation: number): void;

  scaleTree(
    branch: Branch,
    scaleX: number,
    scaleY: number,
    centerX: number,
    centerY: number
  ): Branch;

  // Graphics and rendering actions
  calculateWindOffset(branch: Branch): Point;

  createBranchContainers(branch: Branch, parentContainer: PIXI.Container): void;

  updateWindPositions(): void;

  updateBranchWindPosition(branch: Branch): void;

  renderMountains(graphics: PIXI.Graphics, width: number, height: number, season: string): void;

  renderGround(graphics: PIXI.Graphics, width: number, height: number, season: string): void;

  generateBranchColor(parentColor: number): number;

  handleResize(event: ResizeObserverEntry[]): void;
}

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
      return 0x00bfff; // Bright deep sky blue
    case 'autumn':
    case 'fall':
      return 0xffa500; // Orange sunset
    case 'winter':
      return 0x708090; // Slate gray
    default:
      return 0x87ceeb; // Default sky blue
  }
}

export function createTreeState(): Forest<TreeState, TreeStateActions> {
  // Initial tree will be generated in initializePixi with proper container dimensions
  const initialTree = generateTree({
    ...defaultTreeConfig,
    centerX: 400, // Placeholder - will be replaced
    centerY: 300, // Placeholder - will be replaced
  });

  const physics = new MatterTreePhysics();

  const forest = new Forest<TreeState, TreeStateActions>({
    value: {
      trunk: initialTree,
      windForce: { x: 0, y: 0 },
      mousePosition: { x: 0, y: 0 },
      growth: 1.0,
      season: 'spring',
      time: 0,
      width: document?.documentElement?.clientWidth ?? 100,
      height: document?.documentElement?.clientHeight ?? 500,
      initialized: false,
      terminated: false,
      forceParams: {
        springStrength: 0.01,
        repulsionStrength: 50, // Increased to make forces more visible
        upwardGravity: 0.005,
        damping: 0.95,
        maxDistance: 60, // Configurable distance scale
        animating: false,
        lastSimulationTime: 0,
      },
    },
    res: new Map<string, unknown>([
      ['pixiApp', null as PIXI.Application | null], // Created in initializePixi
      ['physics', physics],
      ['coordGraphics', null as PIXI.Graphics | null], // Coordinate validation
      ['backgroundGraphics', null as PIXI.Graphics | null], // Mountains and ground
      ['treeGraphics', null as PIXI.Graphics | null], // Tree rendering
      ['container', null as HTMLDivElement | null],
      ['resizeObserver', null as ResizeObserver | null],
    ]),
    actions: {
      // Initialize Pixi app with container
      cleanup() {
        const state = this as unknown as Forest<TreeState, TreeStateActions>;
        // Remove resize observer
        const resizeObserver = state.res.get('resizeObserver') as ResizeObserver | null;
        if (resizeObserver) {
          resizeObserver.disconnect();
        }
        const pixiApp = state.res.get('pixiApp') as PIXI.Application | null;
        if (pixiApp) {
          pixiApp.destroy(true);
        }
        state.set('terminated', true);
      },

      calculateWindOffset(value: TreeState, branch: Branch): Point {
        const state = this as unknown as Forest<TreeState, TreeStateActions>;

        if (!branch.children || branch.children.length === 0) {
          // Leaf branch - direct wind effect with exponential falloff by generation
          const generationFalloff = Math.exp(-branch.generation * 0.3); // Exponential decay by generation
          const baseWindMultiplier = 4.0; // Doubled base multiplier for more movement
          const windMultiplier = baseWindMultiplier * generationFalloff;
          return {
            x: value.windForce.x * windMultiplier,
            y: value.windForce.y * windMultiplier,
          };
        } else {
          // Non-leaf branch - find closest leaf and scale by distance
          const closestLeaf = state.acts.findClosestLeaf(branch);
          if (!closestLeaf) {
            return { x: 0, y: 0 };
          }

          // Calculate distance to closest leaf
          const dx = closestLeaf.absolutePosition.x - branch.absolutePosition.x;
          const dy = closestLeaf.absolutePosition.y - branch.absolutePosition.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Calculate leaf's wind offset with exponential falloff
          const generationFalloff = Math.exp(-closestLeaf.generation * 0.3);
          const baseWindMultiplier = 4.0;
          const leafWindMultiplier = baseWindMultiplier * generationFalloff;
          const leafWindOffset = {
            x: value.windForce.x * leafWindMultiplier,
            y: value.windForce.y * leafWindMultiplier,
          };

          // Exponential falloff based on distance
          const falloffRate = 0.02; // Controls how quickly wind effect decays
          const distanceScale = Math.exp(-distance * falloffRate);

          return {
            x: leafWindOffset.x * distanceScale,
            y: leafWindOffset.y * distanceScale,
          };
        }
      },

      findClosestLeaf(value, branch: Branch): Branch | null {
        let closestLeaf: Branch | null = null;
        let closestDistance = Infinity;

        const searchLeaves = (searchBranch: Branch) => {
          if (!searchBranch.children || searchBranch.children.length === 0) {
            // This is a leaf
            const dx = searchBranch.absolutePosition.x - branch.absolutePosition.x;
            const dy = searchBranch.absolutePosition.y - branch.absolutePosition.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < closestDistance) {
              closestDistance = distance;
              closestLeaf = searchBranch;
            }
          } else {
            // Search children
            searchBranch.children?.forEach((child) => {
              if (child) {
                searchLeaves(child);
              }
            });
          }
        };

        // Search from this branch's children
        branch.children?.forEach((child) => {
          if (child) {
            searchLeaves(child);
          }
        });

        return closestLeaf;
      },

      createBranchContainers(value, branch: Branch, parentContainer: PIXI.Container) {
        const state = this as unknown as Forest<TreeState, TreeStateActions>;

        // Create container for this branch
        const container = new PIXI.Container();
        container.name = branch.id; // Name container with branch ID
        container.position.set(0, 0);
        parentContainer.addChild(container);

        // Create graphics for this branch
        const graphics = new PIXI.Graphics();
        graphics.setStrokeStyle({ width: Math.max(1, branch.thickness), color: branch.color });

        // Draw branch line from (0,0) to its relative position
        const endX = branch.relativePosition.x;
        const endY = branch.relativePosition.y;
        graphics.moveTo(0, 0);
        graphics.lineTo(endX, endY);
        graphics.stroke();

        if (!branch.children || branch.children.length === 0) {
          // Draw leaf indicator
          graphics.setFillStyle({ color: 0x228b22 });
          graphics.circle(endX, endY, 2);
          graphics.fill();
        }

        container.addChild(graphics);

        // Position container at parent's end point (for trunk, position at base)
        if (branch.generation === 0) {
          // Trunk positioned at its base
          container.position.set(
            branch.absolutePosition.x,
            branch.absolutePosition.y + branch.length
          );
        } else {
          // Child branches positioned at parent's end
          container.position.set(
            branch.absolutePosition.x - branch.relativePosition.x,
            branch.absolutePosition.y - branch.relativePosition.y
          );
        }

        // Recursively create containers for children
        branch.children?.forEach((child: Branch) => {
          if (child) {
            state.acts.createBranchContainers(child, container);
          }
        });
      },

      updateWindPositions(value) {
        const state = this as unknown as Forest<TreeState, TreeStateActions>;
        state.acts.updateBranchWindPosition(value.trunk);
      },

      updateBranchWindPosition(value, branch: Branch) {
        const state = this as unknown as Forest<TreeState, TreeStateActions>;
        const treeGraphics = state.res.get('treeGraphics') as PIXI.Container;
        if (!treeGraphics) {
          return;
        }

        // Find container by branch ID
        const container = treeGraphics.getChildByName(branch.id) as PIXI.Container;
        if (!container) {
          return;
        }

        // Calculate wind offset for this branch
        const windOffset = state.acts.calculateWindOffset(branch);

        // Apply wind rotation/translation to container
        if (windOffset.x !== 0 || windOffset.y !== 0) {
          const windAngle = Math.atan2(windOffset.y, windOffset.x);

          // Apply subtle rotation based on wind
          container.rotation = windAngle * 0.1; // 10% of wind angle

          // Apply position offset
          container.position.x += windOffset.x * 0.3;
          container.position.y += windOffset.y * 0.3;
        }

        // Recursively update children
        branch.children?.forEach((child: Branch) => {
          if (child) {
            state.acts.updateBranchWindPosition(child);
          }
        });
      },

      // Cleanup Pixi resources
      getSeasonalBackground(value) {
        switch (value.season) {
          case 'spring':
            return 'linear-gradient(to bottom, #87CEEB 0%, #98FB98 70%, #90EE90 100%)';
          case 'summer':
            return 'linear-gradient(to bottom, #00BFFF 0%, #FFD700 30%, #FFFF00 60%, #7CFC00 100%)';
          case 'autumn':
            return 'linear-gradient(to bottom, #D2691E 0%, #DEB887 50%, #CD853F 100%)';
          case 'winter':
            return 'linear-gradient(to bottom, #B0C4DE 0%, #E6E6FA 50%, #F0F8FF 100%)';
          default:
            return 'linear-gradient(to bottom, #87CEEB 0%, #98FB98 100%)';
        }
      },

      // Update mouse position
      getSeasonalStrength(value) {
        switch (value.season) {
          case 'spring':
            return 0.7;
          case 'summer':
            return 0.4;
          case 'autumn':
            return 0.8;
          case 'winter':
            return 1.0;
          default:
            return 0.6;
        }
      },

      // Update wind toward current mouse position with seasonal strength
      handleResize(value, event: ResizeObserverEntry[]) {
        const state = this as unknown as Forest<TreeState, TreeStateActions>;
        const [ev] = event;
        if (!ev) {
          return;
        }
        const { contentRect } = ev;

        // Get new container dimensions
        const newWidth = contentRect.width;
        const newHeight = contentRect.height;

        // Calculate scale factors based on container size change
        const oldWidth = value.width;
        const oldHeight = value.height;
        const scaleX = newWidth / oldWidth;
        const scaleY = newHeight / oldHeight;

        // Calculate new center position
        const newCenterX = newWidth / 2;
        const newCenterY = newHeight * 0.97; // Root at 97% down from top (3% up from bottom)

        // Scale existing tree instead of regenerating
        const scaledTrunk = state.acts.scaleTree(
          value.trunk,
          scaleX,
          scaleY,
          newCenterX,
          newCenterY
        );

        // Update state
        state.set('width', newWidth);
        state.set('height', newHeight);
        state.set('trunk', scaledTrunk);

        // Update physics with scaled tree
        const physics = state.res.get('physics') as MatterTreePhysics;
        physics.initializeTree(scaledTrunk);

        // Re-render tree
        const treeGraphics = state.res.get('treeGraphics') as PIXI.Graphics;
        const coordGraphics = state.res.get('coordGraphics') as PIXI.Graphics;
        if (treeGraphics && coordGraphics) {
          Graphics.renderTree(treeGraphics, coordGraphics, scaledTrunk);
        }
      },

      // Render coordinate validation target in centered square
      async initializePixi(value, container: HTMLDivElement) {
        if (value.initialized || !container) {
          return;
        }
        const state = this as Forest<TreeState, TreeStateActions>;
        state.set('initialized', true);
        state.res.set('container', container);

        // Get container dimensions for proper tree sizing
        const pixiApp = await makePixi(container);
        const containerRect = container.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;

        // Let Pixi append its canvas to the container
        container.appendChild(pixiApp.canvas);
        state.res.set('pixiApp', pixiApp);

        // Generate tree with container-specific dimensions
        const treeConfig = {
          ...defaultTreeConfig,
          centerX: containerWidth / 2, // Center horizontally in container
          centerY: containerHeight * 0.97, // Root at 97% down from top (3% up from bottom)
        };

        // Option to use store-based tree generation (ForestBranch approach)
        const useStoreBasedGeneration = false; // Use traditional generation for now

        if (useStoreBasedGeneration) {
          // Use store-based tree generation with ForestBranch for reactive updates
          state.acts.generateTreeInStore(treeConfig);
        } else {
          // Use traditional tree generation
          const containerTree = generateTree(treeConfig);
          state.set('trunk', containerTree);
        }

        // Create graphics containers in proper z-order (back to front)
        const { backgroundGraphics, treeGraphics, coordGraphics } = createContainers(
          state,
          pixiApp
        );

        // Initialize physics with the tree
        const physics = state.res.get('physics') as MatterTreePhysics;
        physics.initializeTree(value.trunk);

        // Force-directed layout removed

        // Add global mouse move listener using Pixi's event system
        pixiApp.stage.eventMode = 'static';
        pixiApp.stage.hitArea = pixiApp.screen;

        const handleGlobalMouseMove = (event: PIXI.FederatedMouseEvent) => {
          // Use global coordinates relative to the PIXI stage
          state.acts.setMousePosition(event.global.x, event.global.y);
        };

        pixiApp.stage.on('globalmousemove', handleGlobalMouseMove);

        // Add ResizeObserver to watch container size changes

        // Use ResizeObserver for more efficient container resize detection
        const resizeObserver = new ResizeObserver((event) => {
          state.acts.handleResize(event);
        });
        resizeObserver.observe(container);

        state.res.set('resizeObserver', resizeObserver);

        // Draw background once during initialization
        renderBackground(backgroundGraphics, pixiApp, value.season);

        // Initial render with background
        renderTree(treeGraphics, coordGraphics, value.trunk);
      },

      // Draw a single branch with wind effects
      renderCoordinateValidation() {
        const state = this as unknown as Forest<TreeState, TreeStateActions>;
        const coordGraphics = state.res.get('coordGraphics') as PIXI.Graphics | null;
        const pixiApp = state.res.get('pixiApp') as PIXI.Application | null;
        if (!coordGraphics || !pixiApp) {
          return;
        }
        // Coordinate validation rendering
        coordGraphics.clear();

        // Calculate centered square based on min(width, height)
        const screenWidth = pixiApp.screen.width;
        const screenHeight = pixiApp.screen.height;
        const squareSize = Math.min(screenWidth, screenHeight);
        const squareX = (screenWidth - squareSize) / 2;
        const squareY = (screenHeight - squareSize) / 2;
        const centerX = screenWidth / 2;
        const centerY = screenHeight / 2;

        coordGraphics.setStrokeStyle({
          width: 2,
          color: '#660000',
          alpha: 1,
        });

        coordGraphics
          .rect(0, 0, screenWidth, screenHeight)
          .moveTo(0, 0)
          .lineTo(screenWidth, screenHeight)
          .moveTo(0, screenHeight)
          .lineTo(screenWidth, 0)
          .stroke();

        // Draw square boundary (for debugging)
        coordGraphics.setStrokeStyle({
          width: 1,
          color: 0x666666,
          alpha: 0.3,
        });
        coordGraphics.rect(squareX, squareY, squareSize, squareSize);
        coordGraphics.circle(centerX, centerY, squareSize / 2);

        coordGraphics.stroke();
        // Draw center crosshairs for square center (GREEN)

        coordGraphics.lineStyle(2, 0x00ff00, 0.6);
        coordGraphics.moveTo(centerX - 20, centerY);
        coordGraphics.lineTo(centerX + 20, centerY);
        coordGraphics.moveTo(centerX, centerY - 20);
        coordGraphics.lineTo(centerX, centerY + 20);

        // Center circle
        coordGraphics.lineStyle(1, 0x00ff00, 0.6);
        coordGraphics.drawCircle(centerX, centerY, 5);
        coordGraphics.stroke();
        // Coordinate validation complete
      },

      // Render ground and mountains
      renderBackground(value) {
        const state = this as unknown as Forest<TreeState, TreeStateActions>;
        const backgroundGraphics = state.res.get('backgroundGraphics') as PIXI.Graphics | null;
        const pixiApp = state.res.get('pixiApp') as PIXI.Application | null;
        if (!backgroundGraphics || !pixiApp) {
          return;
        }

        // Clear previous background
        backgroundGraphics.clear();

        const screenWidth = pixiApp.screen.width;
        const screenHeight = pixiApp.screen.height;

        // Draw mountains in background layer
        state.acts.renderMountains(backgroundGraphics, screenWidth, screenHeight, value.season);

        // Draw ground in background layer
        state.acts.renderGround(backgroundGraphics, screenWidth, screenHeight, value.season);
      },

      renderMountains(
        value,
        graphics: PIXI.Graphics,
        width: number,
        height: number,
        season: string
      ) {
        // Mountain colors based on season
        let mountainColor = 0x696969; // Default gray
        switch (season) {
          case 'spring':
            mountainColor = 0x708090; // Slate gray with hint of blue
            break;
          case 'summer':
            mountainColor = 0x8fbc8f; // Dark sea green
            break;
          case 'autumn':
            mountainColor = 0xa0522d; // Sienna brown
            break;
          case 'winter':
            mountainColor = 0xf0f8ff; // Alice blue (snowy)
            break;
        }

        graphics.setFillStyle({ color: mountainColor, alpha: 0.6 });

        // Generate jagged mountain silhouette
        const mountainHeight = height * 0.4; // Mountains take up 40% of height
        const peaks = 8; // Number of mountain peaks
        const peakWidth = width / peaks;

        graphics.moveTo(0, height - mountainHeight);

        for (let i = 0; i <= peaks; i++) {
          const x = i * peakWidth;
          const baseHeight = mountainHeight * (0.3 + Math.random() * 0.7); // Vary peak heights
          const y = height - baseHeight;

          // Add jagged edges
          const jaggedPoints = 3 + Math.floor(Math.random() * 4); // 3-6 jagged points per peak
          for (let j = 0; j < jaggedPoints; j++) {
            const jagX = x + (j / jaggedPoints) * peakWidth;
            const jagY = y + (Math.random() - 0.5) * 30; // Random jaggedness
            graphics.lineTo(jagX, jagY);
          }
        }

        // Complete the mountain shape
        graphics.lineTo(width, height);
        graphics.lineTo(0, height);
        graphics.fill();
      },

      renderGround(value, graphics: PIXI.Graphics, width: number, height: number, season: string) {
        // Ground colors based on season
        let groundColor = 0x8b4513; // Default brown
        switch (season) {
          case 'spring':
            groundColor = 0x9acd32; // Yellow green (fresh grass)
            break;
          case 'summer':
            groundColor = 0x228b22; // Forest green (lush grass)
            break;
          case 'autumn':
            groundColor = 0xd2691e; // Chocolate brown (fallen leaves)
            break;
          case 'winter':
            groundColor = 0xfffafa; // Snow white
            break;
        }

        graphics.setFillStyle({ color: groundColor });

        // Ground takes up bottom 15% of screen
        const groundHeight = height * 0.15;
        const groundY = height - groundHeight;

        // Create slightly uneven ground surface
        graphics.moveTo(0, groundY);

        const segments = 20;
        const segmentWidth = width / segments;

        for (let i = 0; i <= segments; i++) {
          const x = i * segmentWidth;
          const variation = (Math.random() - 0.5) * 10; // Small height variations
          const y = groundY + variation;
          graphics.lineTo(x, y);
        }

        // Complete ground rectangle
        graphics.lineTo(width, height);
        graphics.lineTo(0, height);
        graphics.fill();
      },

      // Render tree to Pixi graphics
      renderTree(value) {
        const state = this as unknown as Forest<TreeState, TreeStateActions>;
        const graphics = state.res.get('treeGraphics') as PIXI.Graphics | null;
        const coordGraphics = state.res.get('coordGraphics') as PIXI.Graphics | null;
        if (!graphics || !coordGraphics) {
          return;
        }

        graphics.clear();

        // Render coordinate validation in separate container (hidden)
        // state.acts.renderCoordinateValidation();

        // Draw entire tree using drawBranch utility function (including trunk)
        Graphics.drawBranch(graphics, value.trunk);
      },

      // Get seasonal wind strength
      setMousePosition(value, mouseX: number, mouseY: number) {
        const state = this as unknown as Forest<TreeState, TreeStateActions>;
        state.set('mousePosition', { x: mouseX, y: mouseY });
      },

      // Set season and update colors only
      setSeason(value, event: React.MouseEvent<HTMLButtonElement>) {
        const target = event.target as HTMLButtonElement;
        const season = target.dataset.season as TreeState['season'];
        const state = this as unknown as Forest<TreeState, TreeStateActions>;
        state.set('season', season);
        // Just update colors, don't regenerate tree structure
        state.acts.changeSeason(season);
      },

      // Animation tick - update time and run force simulation if enabled
      tick(value) {
        const state = this as unknown as Forest<TreeState, TreeStateActions>;
        state.set('time', value.time + 1);

        // Force simulation removed - using wind only
      },

      // Get seasonal background
      updateWindToward(value) {
        const state = this as unknown as Forest<TreeState, TreeStateActions>;
        const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        const mouse = value.mousePosition;

        // Mouse point - center
        const delta = Vector.sub(mouse, center);
        const magnitude = Vector.magnitude(delta);
        const seasonalStrength = state.acts.getSeasonalStrength();

        let targetWind;
        if (magnitude === 0) {
          // Default wind when mouse is at center: horizontal wind
          targetWind = { x: seasonalStrength * 50, y: 0 };
        } else {
          // Normalize and scale by seasonal strength
          const normalized = Vector.normalise(delta);
          targetWind = Vector.mult(normalized, seasonalStrength * 50);
        }

        // Lerp current wind (could adjust lerp based on time since last update)
        const currentWind = { ...value.windForce };
        const lerpFactor = 0.05;
        const newWind = vectorLerp(currentWind, targetWind, lerpFactor);

        this.set('windForce', newWind);
      },

      // Update force simulation parameters
      updateForceParams(value, params: Partial<TreeState['forceParams']>) {
        const state = this as unknown as Forest<TreeState, TreeStateActions>;
        const newParams = { ...value.forceParams, ...params };
        state.set('forceParams', newParams);

        // Update the force layout if it exists
        const forceLayout = state.res.get('forceLayout');
        if (forceLayout) {
          forceLayout.updateParams(newParams);
        }
      },

      // Start/stop force animation
      toggleForceAnimation(value) {
        const state = this as unknown as Forest<TreeState, TreeStateActions>;
        const newAnimating = !value.forceParams.animating;
        state.acts.updateForceParams({ animating: newAnimating });
      },

      // Single step of force simulation
      stepForceSimulation(value) {
        const state = this as unknown as Forest<TreeState, TreeStateActions>;
        const forceLayout = state.res.get('forceLayout');
        if (forceLayout) {
          forceLayout.simulate(1);
          const updatedTrunk = produce(value.trunk, (draft) => {
            forceLayout.applyToTree(draft);
          });
          state.set('trunk', updatedTrunk);
          const treeGraphics = state.res.get('treeGraphics') as PIXI.Graphics;
          const coordGraphics = state.res.get('coordGraphics') as PIXI.Graphics;
          if (treeGraphics && coordGraphics) {
            Graphics.renderTree(treeGraphics, coordGraphics, updatedTrunk);
          }

          // Dump partial tree JSON
          state.acts.dumpTreeJSON();
        }
      },

      dumpTreeJSON(value) {
        console.log('Full Trunk Data:', JSON.stringify(value.trunk, null, 2));
      },

      changeSeason(value, season: 'spring' | 'summer' | 'autumn' | 'fall' | 'winter') {
        const state = this as unknown as Forest<TreeState, TreeStateActions>;

        // Update tree with new leaf colors using immutable update
        const updatedTrunk = state.acts.updateLeafColorsImmutable(value.trunk, season);
        state.set('trunk', updatedTrunk);

        // Update background color
        const pixiApp = state.res.get('pixiApp') as PIXI.Application | null;
        if (pixiApp) {
          const seasonalBgColor = getSeasonalBackgroundColor(season);
          pixiApp.renderer.background.color = seasonalBgColor;
        }

        // Redraw background with new seasonal colors
        const backgroundGraphics = state.res.get('backgroundGraphics') as PIXI.Graphics;
        if (backgroundGraphics && pixiApp) {
          Graphics.renderBackground(backgroundGraphics, pixiApp, season);
        }

        const treeGraphics = state.res.get('treeGraphics') as PIXI.Graphics;
        const coordGraphics = state.res.get('coordGraphics') as PIXI.Graphics;
        if (treeGraphics && coordGraphics) {
          Graphics.renderTree(treeGraphics, coordGraphics, updatedTrunk);
        }
        console.log(`Season changed to: ${season}`);
      },

      // Scale tree to fit new container dimensions
      scaleTree(
        value,
        branch: Branch,
        scaleX: number,
        scaleY: number,
        centerX: number,
        centerY: number
      ): Branch {
        return produce(branch, (draft) => {
          // Scale positions relative to center
          const scaledAbsoluteX = (branch.absolutePosition.x - centerX) * scaleX + centerX;
          const scaledAbsoluteY = (branch.absolutePosition.y - centerY) * scaleY + centerY;

          draft.absolutePosition.x = scaledAbsoluteX;
          draft.absolutePosition.y = scaledAbsoluteY;

          // Scale relative positions
          draft.relativePosition.x *= scaleX;
          draft.relativePosition.y *= scaleY;

          // Scale length and thickness
          draft.length *= Math.max(scaleX, scaleY); // Use larger scale for length
          draft.thickness *= Math.max(scaleX, scaleY); // Scale thickness proportionally

          // Scale leaf positions
          draft.leaves.forEach((leaf) => {
            const scaledLeafX = (leaf.position.x - centerX) * scaleX + centerX;
            const scaledLeafY = (leaf.position.y - centerY) * scaleY + centerY;
            leaf.position.x = scaledLeafX;
            leaf.position.y = scaledLeafY;

            // Scale leaf size
            leaf.size *= Math.max(scaleX, scaleY);
          });

          // Recursively scale children
          draft.children = draft.children.map((child) =>
            this.acts.scaleTree(child, scaleX, scaleY, centerX, centerY)
          );
        });
      },

      updateLeafColorsImmutable(value, branch: Branch, season: string): Branch {
        // Get seasonal colors from the tree generator
        const seasonalParams = getSeasonalParams(season);

        return produce(branch, (draft) => {
          // Update leaf colors for this branch
          if (draft.leaves && draft.leaves.length > 0) {
            draft.leaves.forEach((leaf) => {
              leaf.color =
                seasonalParams.leafColors[
                  Math.floor(Math.random() * seasonalParams.leafColors.length)
                ];
            });
          }

          // Recursively update children
          if (draft.children) {
            draft.children.forEach((child, index) => {
              const state = this as unknown as Forest<TreeState, TreeStateActions>;
              draft.children[index] = state.acts.updateLeafColorsImmutable(child, season);
            });
          }
        });
      },

      // Generate tree using store-based approach with ForestBranch for each node
      generateTreeInStore(value, config: TreeConfig) {
        const state = this as unknown as Forest<TreeState, TreeStateActions>;

        // Create trunk as root of tree
        const centerX = config.centerX ?? 400;
        const centerY = config.centerY ?? 600;
        const trunkLength = 133; // Scaled up 11% from 120

        const trunk: Branch = {
          id: 'trunk',
          relativePosition: { x: 0, y: 0 }, // Trunk is at origin
          absolutePosition: { x: centerX, y: centerY },
          angle: -Math.PI / 2, // Pointing up
          thickness: 18, // Made trunk thicker
          length: trunkLength,
          children: [],
          leaves: [],
          generation: 0,
          level: 0,
          color: 0x8b4513, // Brown
          branchCountOffset: 0,
          ancestralOffsetSum: 0,
          levelChangeOffset: 0,
          ancestralLevelSum: 0,
          velocity: { x: 0, y: 0 },
          force: { x: 0, y: 0 },
          springConstant: 0.02,
          mass: 100,
        };

        // Generate branches recursively and build complete tree
        state.acts.generateBranchesRecursively(trunk, config, 0);

        // Set complete tree in store
        state.set('trunk', trunk);
      },

      // Generate branches recursively using transient ForestBranch instances
      generateBranchesRecursively(value, parent: Branch, config: TreeConfig, generation: number) {
        const state = this as unknown as Forest<TreeState, TreeStateActions>;

        if (generation >= config.maxGenerations) {
          return; // Terminal branch
        }

        // Generate branch properties
        const numBranches = 2 + Math.floor(Math.random() * 2); // Simple branch count

        for (let i = 0; i < numBranches; i++) {
          // Create transient ForestBranch for this branch during creation
          const branchPath = `${parent.id}-child-${i}`;
          const branchForest = createForestBranch(state, branchPath);

          // Use the transient ForestBranch to create and manage this branch
          const newBranch = branchForest.acts.initializeBranch(
            parent,
            i,
            numBranches,
            config,
            generation
          );

          // Verify the branch was created properly
          if (!newBranch || !newBranch.absolutePosition) {
            console.error('Failed to create valid branch:', newBranch);
            continue;
          }

          // Add the new branch to the parent's children using Forest's mutate method
          state.mutate((draft) => {
            // Find the parent in the draft tree and add the new branch
            const findAndUpdateParent = (branch: Branch): boolean => {
              if (branch.id === parent.id) {
                branch.children.push(newBranch);
                return true;
              }
              return branch.children.some((child) => findAndUpdateParent(child));
            };

            if (draft.trunk) {
              findAndUpdateParent(draft.trunk);
            }
          });

          // Generate children for the new branch - pass the newBranch directly
          if (generation + 1 < config.maxGenerations) {
            state.acts.generateBranchesRecursively(newBranch, config, generation + 1);
          }

          // ForestBranch is now transient - it will be garbage collected
          // The branch data is now part of the main tree structure
        }
      },

      // Helper method to calculate branch count
      calculateBranchCount(value, parent: Branch, config: TreeConfig, generation: number): number {
        // Use the tree generation algorithm from treeGenerator
        const baseBranches = generation === 0 ? 2 : 3;
        const variation = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
        return Math.max(1, baseBranches + variation);
      },

      // Helper method to create branch data
      createBranchData(
        value,
        parent: Branch,
        index: number,
        numBranches: number,
        config: TreeConfig,
        generation: number
      ): Branch {
        const state = this as unknown as Forest<TreeState, TreeStateActions>;

        // Calculate angle using the same logic as treeGenerator
        let finalAngle;
        if (generation === 0) {
          const maxSpread = Math.PI / 3; // 60 degrees
          const angleOffset =
            (index - (numBranches - 1) / 2) * (maxSpread / Math.max(1, numBranches - 1));
          finalAngle = -Math.PI / 2 + angleOffset + (Math.random() - 0.5) * 0.2;
        } else {
          const maxSpread = Math.PI / 3;
          const angleOffset =
            (index - (numBranches - 1) / 2) * (maxSpread / Math.max(1, numBranches - 1));
          finalAngle = parent.angle + angleOffset + (Math.random() - 0.5) * 0.3 - 0.1; // Upward bias
        }

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
          color: state.acts.generateBranchColor(parent.color),
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

      // Helper method to generate branch color variation using chroma-js
      generateBranchColor(value, parentColor: number): number {
        // Convert hex number to chroma color
        const baseColor = chroma(parentColor);

        // Add subtle random variations to hue, saturation, and lightness
        const hueVariation = (Math.random() - 0.5) * 10; // ±5 degrees
        const satVariation = (Math.random() - 0.5) * 0.1; // ±0.05 saturation
        const lightVariation = (Math.random() - 0.5) * 0.1; // ±0.05 lightness

        // Apply variations and ensure values stay in valid ranges
        const newColor = baseColor
          .set('hsl.h', `+${hueVariation}`)
          .set('hsl.s', Math.max(0, Math.min(1, baseColor.get('hsl.s') + satVariation)))
          .set('hsl.l', Math.max(0.1, Math.min(0.9, baseColor.get('hsl.l') + lightVariation)));

        // Convert back to hex number for PIXI
        return parseInt(newColor.hex().replace('#', ''), 16);
      },

      // Utility method to create seasonal color palettes
      createSeasonalPalette(value, season: string): number[] {
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
              parseInt(
                chroma(baseBrown).set('hsl.h', 220).desaturate(0.5).hex().replace('#', ''),
                16
              ), // Cool brown
            ];
          default:
            return [baseBrown];
        }
      },
    },
    prep: (input, current, _initial) => {
      return { ...current, ...input };
    },
  });

  const tryInit = () => {
    if (!window || forest.value.terminated) {
      return;
    }

    const container = window.document.getElementById('tree-container');
    if (!container) {
      setTimeout(tryInit, 100);
    } else {
      forest.$.initializePixi(container);
    }
  };

  tryInit();

  forest.set('season', 'spring');
  return forest;
}
