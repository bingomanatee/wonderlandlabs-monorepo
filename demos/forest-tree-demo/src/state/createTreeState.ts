import { Vector } from 'matter-js';
import * as PIXI from 'pixi.js';
import type { ActionExposedRecord } from '@wonderlandlabs/forestry4';
import { Forest } from '@wonderlandlabs/forestry4';
import type { Branch, Point, TreeState } from '../types';
import { defaultTreeConfig, generateTree } from '../treeGenerator';
import { MatterTreePhysics } from '../matterTreePhysics';

// Type interface for all tree state actions
export interface TreeStateActions extends ActionExposedRecord {
  initializePixi(container: HTMLDivElement): void;

  cleanup(): void;

  setMousePosition(mouseX: number, mouseY: number): void;

  updateWindToward(): void;

  getSeasonalStrength(): number;

  tick(): void;

  setSeason(season: TreeState['season']): void;

  getSeasonalBackground(): string;

  renderCoordinateValidation(): void;

  drawBranch(branch: Branch): void;

  renderTree(): void;
}

// Vector lerp utility using Matter.js operations
const vectorLerp = (a: Point, b: Point, t: number): Point => {
  const scaledA = Vector.mult(Vector.clone(a), 1 - t);
  const scaledB = Vector.mult(Vector.clone(b), t);
  return Vector.add(scaledA, scaledB);
};

export function createTreeState(): Forest<TreeState, TreeStateActions> {
  // Initial tree will be generated in initializePixi with proper container dimensions
  const initialTree = generateTree({
    ...defaultTreeConfig,
    centerX: 400, // Placeholder - will be replaced
    centerY: 300, // Placeholder - will be replaced
  });

  const physics = new MatterTreePhysics();

  const forest = new Forest<TreeState>({
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
    },
    res: new Map<string, unknown>([
      ['pixiApp', null as PIXI.Application | null], // Created in initializePixi
      ['physics', physics],
      ['coordGraphics', null as PIXI.Graphics | null], // Coordinate validation
      ['treeGraphics', null as PIXI.Graphics | null],
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

      drawBranch(value, branch: Branch) {
        const state = this as unknown as Forest<TreeState, TreeStateActions>;
        const graphics = state.res.get('treeGraphics') as PIXI.Graphics | null;
        if (!graphics) {
          return;
        }

        graphics.lineStyle(Math.max(1, branch.thickness), 0x8b4513);
        graphics.moveTo(branch.startPoint.x, branch.startPoint.y);

        if (!branch.children || branch.children.length === 0) {
          // This is a leaf branch - apply wind effect
          const windMultiplier = 0.5 * (7 - branch.generation);
          const windEffect = {
            x: branch.endPoint.x + value.windForce.x * windMultiplier,
            y: branch.endPoint.y + value.windForce.y * windMultiplier,
          };
          graphics.lineTo(windEffect.x, windEffect.y);

          // Draw a small circle at the end to show it's a leaf branch
          graphics.beginFill(0x228b22);
          graphics.drawCircle(windEffect.x, windEffect.y, 2);
          graphics.endFill();
        } else {
          graphics.lineTo(branch.endPoint.x, branch.endPoint.y);
          // Recursively draw children
          branch.children.forEach((child: Branch) => state.acts.drawBranch(child));
        }
      },

      // Cleanup Pixi resources
      getSeasonalBackground(value) {
        switch (value.season) {
          case 'spring':
            return 'linear-gradient(to bottom, #87CEEB 0%, #98FB98 70%, #90EE90 100%)';
          case 'summer':
            return 'linear-gradient(to bottom, #87CEFA 0%, #FFE4B5 50%, #98FB98 100%)';
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
        console.log('resize event: ', event);
        const [ev] = event;
        if (!ev) {
          return;
        }
        const { contentRect } = ev;

        // Get new container dimensions
        const newWidth = contentRect.width;
        const newHeight = contentRect.height;

        console.log('size:', newWidth, newHeight);
        state.set('width', newWidth);
        state.set('height', newHeight);

        // Regenerate tree with new container dimensions
        const newTreeConfig = {
          ...defaultTreeConfig,
          centerX: newWidth / 2,
          centerY: newHeight - 50,
        };
        const newTree = generateTree(newTreeConfig);
        state.acts.renderCoordinateValidation();

        // Update tree state and physics
        state.set('trunk', newTree);
        const physics = state.res.get('physics') as MatterTreePhysics;
        physics.initializeTree(newTree);

        // Re-render tree
        state.acts.renderTree();
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

        // Let Pixi append its canvas to the container
        container.appendChild(pixiApp.canvas);
        state.res.set('pixiApp', pixiApp);

        // Generate tree with container-specific dimensions
        const treeConfig = {
          ...defaultTreeConfig,
          centerX: containerWidth / 2, // Center horizontally in container
          centerY: containerHeight - 50, // Base near bottom with margin
        };
        const containerTree = generateTree(treeConfig);

        // Update tree state with container-sized tree
        state.set('trunk', containerTree);

        // Create coordinate validation graphics (rendered before tree)
        const coordGraphics = new PIXI.Graphics();
        coordGraphics.position.set(0, 0);
        pixiApp.stage.addChild(coordGraphics);
        state.res.set('coordGraphics', coordGraphics);
        console.log('--- coord graphics appended');
        // Create graphics object for tree
        const treeGraphics = new PIXI.Graphics();
        treeGraphics.position.set(0, 0);
        pixiApp.stage.addChild(treeGraphics);
        state.res.set('treeGraphics', treeGraphics);

        // Initialize physics with container-sized tree
        const physics = state.res.get('physics') as MatterTreePhysics;
        physics.initializeTree(containerTree);

        // Add global mouse move listener using Pixi's event system
        pixiApp.stage.eventMode = 'static';
        pixiApp.stage.hitArea = pixiApp.screen;

        const handleGlobalMouseMove = (event: PIXI.FederatedMouseEvent) => {
          // Use clientX/Y directly - no coordinate conversion needed!
          state.acts.setMousePosition(event.clientX, event.clientY);
        };

        pixiApp.stage.on('globalmousemove', handleGlobalMouseMove);

        // Add ResizeObserver to watch container size changes

        // Use ResizeObserver for more efficient container resize detection
        const resizeObserver = new ResizeObserver((event) => {
          state.acts.handleResize(event);
        });
        resizeObserver.observe(container);

        state.res.set('resizeObserver', resizeObserver);
      },

      // Draw a single branch with wind effects
      renderCoordinateValidation(value) {
        const state = this as unknown as Forest<TreeState, TreeStateActions>;
        const coordGraphics = state.res.get('coordGraphics') as PIXI.Graphics | null;
        const pixiApp = state.res.get('pixiApp') as PIXI.Application | null;
        if (!coordGraphics || !pixiApp) {
          return;
        }
        console.log('RCV');
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
        console.log('---- drawing coords in ', screenWidth, 'w x ', screenHeight);
        console.log(
          'drawing circle at ',
          centerX,
          centerY,
          'rad',
          squareSize / 2,
          ' and square at ',
          squareX,
          squareY,
          squareSize
        );
        // Get mouse position
        const mouseX = value.mousePosition.x;
        const mouseY = value.mousePosition.y;

        // Only draw target if mouse is within the square
        if (
          mouseX >= squareX &&
          mouseX <= squareX + squareSize &&
          mouseY >= squareY &&
          mouseY <= squareY + squareSize
        ) {
          // Draw target circle at mouse position (RED)
          coordGraphics.lineStyle(2, 0xff0000, 0.8);
          coordGraphics.drawCircle(mouseX, mouseY, 20);
          coordGraphics.drawCircle(mouseX, mouseY, 10);

          // Draw crosshairs at mouse position
          coordGraphics.lineStyle(1, 0xff0000, 0.8);
          coordGraphics.moveTo(mouseX - 15, mouseY);
          coordGraphics.lineTo(mouseX + 15, mouseY);
          coordGraphics.moveTo(mouseX, mouseY - 15);
          coordGraphics.lineTo(mouseX, mouseY + 15);
        }
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
        console.log('RCV end');
      },

      // Render tree to Pixi graphics
      renderTree(value) {
        const state = this as unknown as Forest<TreeState, TreeStateActions>;
        const graphics = state.res.get('treeGraphics') as PIXI.Graphics | null;
        if (!graphics) {
          return;
        }

        graphics.clear();

        // Debug: log wind force occasionally
        if (Math.random() < 0.01) {
          console.log('Wind force:', value.windForce);
        }

        // Draw trunk
        graphics.lineStyle(value.trunk.thickness, 0x8b4513);
        graphics.moveTo(value.trunk.startPoint.x, value.trunk.startPoint.y);
        graphics.lineTo(value.trunk.endPoint.x, value.trunk.endPoint.y);

        // Draw all branches using the drawBranch action
        value.trunk.children.forEach((child: any) => state.acts.drawBranch(child));
      },

      // Get seasonal wind strength
      setMousePosition(value, mouseX: number, mouseY: number) {
        const state = this as unknown as Forest<TreeState, TreeStateActions>;
        state.set('mousePosition', { x: mouseX, y: mouseY });
      },

      // Increment time
      setSeason(value, season: TreeState['season']) {
        const state = this as unknown as Forest<TreeState, TreeStateActions>;
        state.set('season', season);
      },

      // Change season
      tick(value) {
        const state = this as unknown as Forest<TreeState, TreeStateActions>;
        state.set('time', value.time + 1);
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
    },
    prep: (input, current, _initial) => {
      return { ...current, ...input };
    },
  });

  const tryInit = () => {
    if (!window || forest.value.terminated) return;

    const container = window.document.getElementById('tree-container');
    if (!container) {
      setTimeout(tryInit, 100);
    } else {
      forest.$.initializePixi(container);
    }
  };

  tryInit();

  return forest;
}
