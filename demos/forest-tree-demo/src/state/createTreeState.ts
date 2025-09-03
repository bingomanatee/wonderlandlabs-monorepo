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
  // Generate tree with fixed reference dimensions (scaling handled by Pixi containers)
  const treeConfig = {
    ...defaultTreeConfig,
    centerX: 400, // Fixed reference center
    centerY: 460, // Fixed reference center
  };
  const initialTree = generateTree(treeConfig);

  const physics = new MatterTreePhysics();

  const forest = new Forest<TreeState>({
    value: {
      trunk: initialTree,
      windForce: { x: 0, y: 0 },
      mousePosition: { x: 0, y: 0 },
      growth: 1.0,
      season: 'spring',
      time: 0,
    },
    res: new Map<string, unknown>([
      ['pixiApp', null as PIXI.Application | null], // Created in initializePixi
      ['physics', physics],
      ['treeGraphics', null as PIXI.Graphics | null],
      ['container', null as HTMLDivElement | null],
      ['resizeHandler', null as (() => void) | null],
    ]),
    actions: {
      // Initialize Pixi app with container
      initializePixi(value, container: HTMLDivElement) {
        const state = this as Forest<TreeState>;
        state.res.set('container', container);

        // Create Pixi app with container
        const pixiApp = new PIXI.Application({
          width: window.innerWidth,
          height: window.innerHeight,
          backgroundColor: 0x87ceeb,
          antialias: true,
        });

        // Let Pixi append its canvas to the container
        container.appendChild(pixiApp.view);
        state.res.set('pixiApp', pixiApp);

        // Create graphics object for tree
        const treeGraphics = new PIXI.Graphics();

        // Set initial position and anchor point
        treeGraphics.position.set(window.innerWidth / 2, window.innerHeight - 140);

        pixiApp.stage.addChild(treeGraphics);
        state.res.set('treeGraphics', treeGraphics);

        // Initialize physics with tree
        const physics = state.res.get('physics') as MatterTreePhysics;
        physics.initializeTree(value.trunk);

        // Add mouse move listener to Pixi canvas
        const canvas = pixiApp.view;
        const handleMouseMove = (event: MouseEvent) => {
          const rect = canvas.getBoundingClientRect();
          const mouseX = event.clientX - rect.left;
          const mouseY = event.clientY - rect.top;
          state.acts.setMousePosition(mouseX, mouseY);
        };

        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.style.cursor = 'crosshair';

        // Add resize listener to window
        const handleResize = () => {
          // Resize Pixi app
          pixiApp.renderer.resize(window.innerWidth, window.innerHeight);

          // Use Pixi container scaling/positioning instead of regenerating tree
          const treeGraphics = state.res.get('treeGraphics') as PIXI.Graphics;
          if (treeGraphics) {
            // Calculate scale factor based on new dimensions
            const originalWidth = 800; // Reference width
            const originalHeight = 600; // Reference height
            const scaleX = window.innerWidth / originalWidth;
            const scaleY = window.innerHeight / originalHeight;
            const scale = Math.min(scaleX, scaleY); // Maintain aspect ratio

            // Scale and center the tree container
            treeGraphics.scale.set(scale);
            treeGraphics.position.set(window.innerWidth / 2, window.innerHeight - 140);
          }
        };

        state.res.set('resizeHandler', handleResize);
        window.addEventListener('resize', handleResize);
      },

      // Cleanup Pixi resources
      cleanup() {
        const state = this as unknown as Forest<TreeState, TreeStateActions>;
        // Remove event listeners
        const resizeHandler = state.res.get('resizeHandler') as (() => void) | null;
        if (resizeHandler) {
          window.removeEventListener('resize', resizeHandler);
        }
        const pixiApp = state.res.get('pixiApp') as PIXI.Application | null;
        if (pixiApp) {
          pixiApp.destroy(true);
        }
      },

      // Update mouse position
      setMousePosition(value, mouseX: number, mouseY: number) {
        const state = this as unknown as Forest<TreeState, TreeStateActions>;
        state.set('mousePosition', { x: mouseX, y: mouseY });
      },

      // Update wind toward current mouse position with seasonal strength
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

      // Draw a single branch with wind effects
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

      // Increment time
      tick(value) {
        const state = this as unknown as Forest<TreeState, TreeStateActions>;
        state.set('time', value.time + 1);
      },

      // Change season
      setSeason(value, season: TreeState['season']) {
        const state = this as unknown as Forest<TreeState, TreeStateActions>;
        state.set('season', season);
      },

      // Get seasonal background
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
    },
    prep: (input, current, _initial) => {
      return { ...current, ...input };
    },
  });

  return forest;
}
