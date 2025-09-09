import React, { useEffect, useRef } from 'react';
import useForestryLocal from '../hooks/useForestryLocal';
import { TreePhysics } from '../managers/TreePhysics';
import forestDataStore from '../managers/forestDataStore';
import type { TreeStoreData } from '../managers/forestDataStore';
import {
  makePixi,
  createContainers,
  renderBackground,
  renderTree,
  renderCoordinateValidation
} from '../utils/pixiGraphics';
import * as PIXI from 'pixi.js';
import Controls from './Controls';

export function PixiTree() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);
  const pixiAppRef = useRef<PIXI.Application | null>(null);
  const physicsRef = useRef<TreePhysics | null>(null);
  const graphicsRef = useRef<{
    backgroundGraphics: PIXI.Graphics;
    treeGraphics: PIXI.Graphics;
    coordGraphics: PIXI.Graphics;
    leafParticleSystem: any;
  } | null>(null);

  // Create local Forestry store
  const [treeState, dataStore] = useForestryLocal<TreeStoreData>(
    () => forestDataStore(document.createElement('canvas')) // Create dummy canvas for now
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container || isInitializedRef.current) return;

    let cleanup: (() => void) | undefined;

    const initializePixi = async () => {
      try {
        // Create PIXI application
        const pixiApp = await makePixi(container);
        pixiAppRef.current = pixiApp;

        // Store PIXI app in Forestry store for Controls access
        dataStore.res.set('pixiApp', pixiApp);

        // Append PIXI canvas to container
        container.appendChild(pixiApp.canvas);

        // Create graphics containers (async for particle system)
        const graphics = await createContainers(dataStore, pixiApp);
        const { backgroundGraphics, treeGraphics, coordGraphics, leafParticleSystem } = graphics;
        graphicsRef.current = graphics;

        // Render initial background
        renderBackground(backgroundGraphics, pixiApp, 'summer');

        // Create physics simulation with a dummy canvas (we'll use PIXI for rendering)
        const dummyCanvas = document.createElement('canvas');
        dummyCanvas.width = pixiApp.screen.width;
        dummyCanvas.height = pixiApp.screen.height;

        const physics = new TreePhysics(dummyCanvas, dataStore);
        physicsRef.current = physics;

        // Store physics in Forestry store for Controls access
        dataStore.res.set('physics', physics);

        // Generate and build complete tree
        const rootId = dataStore.acts.generateTree(pixiApp.screen.width, pixiApp.screen.height);

        // Create root pin to anchor the tree
        physics.createRootPin(rootId);

        // Set up animation loop
        let animationId: number;
        const animate = () => {
          // Update physics
          physics.update();

          // Render tree with current physics positions
          renderTree(treeGraphics, dataStore, 'summer', pixiApp.canvas.width, pixiApp.canvas.height);

          // Render coordinate grid (optional debug)
          // renderCoordinateValidation(coordGraphics, pixiApp);

          animationId = requestAnimationFrame(animate);
        };

        // Start animation
        animate();

        // Set up cleanup
        cleanup = () => {
          if (animationId) {
            cancelAnimationFrame(animationId);
          }
          if (physics) {
            physics.cleanup();
          }
          if (pixiApp) {
            pixiApp.destroy(true, true);
          }
        };

        isInitializedRef.current = true;

      } catch (error) {
        console.error('Failed to initialize PIXI:', error);
      }
    };

    initializePixi();

    return cleanup;
  }, [dataStore]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const pixiApp = pixiAppRef.current;
      const container = containerRef.current;
      const graphics = graphicsRef.current;
      const physics = physicsRef.current;
      if (!pixiApp || !container || !graphics || !physics) return;

      // PIXI auto-resizes the canvas, but we need to redraw the background
      // and regenerate the tree for the new dimensions
      setTimeout(() => {
        // Small delay to ensure PIXI has finished resizing
        renderBackground(graphics.backgroundGraphics, pixiApp, 'summer');

        // Clear existing tree and regenerate for new canvas size
        dataStore.acts.clearTree();
        const utils = dataStore.res.get('utils');
        if (utils) {
          utils.clear();
        }

        // Generate new tree with new dimensions
        const rootId = dataStore.acts.generateTree(pixiApp.screen.width, pixiApp.screen.height);

        // Create root pin to anchor the new tree
        physics.createRootPin(rootId);
      }, 10);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dataStore]);

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      display: 'flex',
      flexDirection: 'row'
    }}>
      <div 
        ref={containerRef} 
        style={{ 
          flex: 1,
          position: 'relative',
          overflow: 'hidden'
        }} 
      />
      <Controls state={dataStore} />
    </div>
  );
}
