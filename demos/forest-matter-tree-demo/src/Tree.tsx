import { useEffect, useRef, useCallback } from 'react';
import { TreePhysics } from './TreePhysics';
import useForestryLocal from './hooks/useForestryLocal';
import { createForestryTreeData } from './ForestryTreeData';

export function Tree() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isInitializedRef = useRef(false);

  // Create local Forestry store with default dimensions (will be updated)
  const [treeState, forestryTreeData] = useForestryLocal(() => {
    return createForestryTreeData(800, 600); // Default dimensions
  });

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
    if (!canvasRef.current || !forestryTreeData || isInitializedRef.current) return;

    const canvas = canvasRef.current;

    // Set initial canvas size
    updateCanvasSize();

    // Create physics resources now that canvas is available
    forestryTreeData.acts.createResources(canvas);

    // Wait for resources to be created, then initialize
    let onComplete: (() => void) | undefined;

    const initializeWhenReady = () => {
      const treePhysics = forestryTreeData.res.get('treePhysics');
      if (treePhysics) {
        // Resources are ready, initialize tree
        const rootId = forestryTreeData.acts.getRootId();
        if (rootId) {
          treePhysics.createRootPin(rootId);
        }

        // Handle window resize directly with updateCanvasSize
        window.addEventListener('resize', updateCanvasSize);
        isInitializedRef.current = true;

        // Set cleanup function
        onComplete = () => {
          window.removeEventListener('resize', updateCanvasSize);
        };
      } else {
        // Resources not ready yet, try again
        setTimeout(initializeWhenReady, 10);
      }
    };

    initializeWhenReady();

    // Return cleanup function
    return () => {
      onComplete?.();
    };
  }, [forestryTreeData, updateCanvasSize]);

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
