import { useEffect, useRef } from 'react';
import { TreePhysics } from './TreePhysics';
import { forestryTreeData } from './ForestryTreeData.ts';

export function Tree() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (canvasRef.current && !isInitializedRef.current) {
      const canvas = canvasRef.current;
      const container = canvas.parentElement;

      if (!container) return;

      // Set canvas dimensions to match container
      const updateCanvasSize = () => {
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
      };

      updateCanvasSize();

      // Handle window resize
      const handleResize = () => {
        updateCanvasSize();
        // Note: In the original system, this would reinitialize the tree
        // For now, we'll just update canvas size
      };

      window.addEventListener('resize', handleResize);

      // Initialize tree using TreePhysics and TreeController
      const scene = new TreePhysics(canvas);
      const rootId = forestryTreeData.acts.generateTree(canvas.width, canvas.height);
      scene.createRootPin(rootId);

      isInitializedRef.current = true;

      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

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
