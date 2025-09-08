import { useEffect, useRef, useCallback } from 'react';
import useForestryLocal from './hooks/useForestryLocal';
import { TreeController } from './managers/TreeController.ts';
import { TreePhysics } from './managers/TreePhysics.ts';
import forestDataStore, { TreeStoreData } from './managers/forestDataStore.ts';

export function Tree() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isInitializedRef = useRef(false);

  // Create local Forestry store with default dimensions (will be updated)
  const [treeState, forestryTreeData] = useForestryLocal<TreeStoreData>(
    forestDataStore,
    canvasRef.current
  );

  // Memoized canvas size updater
  const updateCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    if (!canvas || !container) return;

    const containerStyle = getComputedStyle(container);
    const paddingLeft = parseFloat(containerStyle.paddingLeft);
    const paddingRight = parseFloat(containerStyle.paddingRight);
    const paddingTop = parseFloat(containerStyle.paddingTop);
    const paddingBottom = parseFloat(containerStyle.paddingBottom);

    const width = container.clientWidth - paddingLeft - paddingRight;
    const height = container.clientHeight - paddingTop - paddingBottom;

    // Set both canvas attributes and CSS dimensions to prevent scaling
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isInitializedRef.current) return;

    // Set initial canvas size
    updateCanvasSize();

    // Create physics resources now that canvas is available

    // Wait for resources to be created, then initialize
    let onComplete: (() => void) | undefined;

    const treeController = new TreeController(treeState);

    // Initialize physics simulation
    const scene = new TreePhysics(canvas, treeController, treeState);

    // Generate and build complete tree using TreeController
    const rootId = treeController.generateTree(canvas.width, canvas.height);

    // Create root pin to anchor the tree
    scene.createRootPin(rootId);

    // Return cleanup function
    return () => {
      onComplete?.();
    };
  }, [updateCanvasSize, treeState]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          border: '1px solid #333',
          borderRadius: '4px',
        }}
      />
    </div>
  );
}
