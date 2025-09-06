import React, { useEffect, useRef } from 'react';
import type { TreeState } from '../types';
import useForestryLocal from '../hooks/useForestryLocal';
import { createTreeState } from '../state/createTreeState';
import Controls from './Controls.tsx';
import style from './Tree.module.css';

// Tree state factory is now in separate file

export const Tree: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Use hook to create and observe tree forest (Pixi created internally)
  const [treeState, treeStore] = useForestryLocal<TreeState>(createTreeState);

  const { windForce } = treeState;

  // Animation loop for wind and time
  useEffect(() => {
    const interval = setInterval(() => {
      // Update time using action
      treeStore.acts.tick();

      // Update wind toward current mouse position using action
      treeStore.acts.updateWindToward();

      // Render tree using state action
      treeStore.acts.renderTree();
    }, 50); // 20 FPS

    return () => clearInterval(interval);
  }, [treeStore]);

  // All resize handling, mouse events, and rendering now managed by state

  return (
    <div className={style['tree-container']}>
      <div
        className={style['tree-area']}
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div ref={containerRef} id="tree-container" className={style['tree-container-inner']} />

        {/* Bottom overlay for debug info */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: 'monospace',
          }}
        >
          Wind: ({windForce.x.toFixed(1)}, {windForce.y.toFixed(1)}) | Time:{' '}
          {Math.floor(treeState.time / 20)}s
        </div>
      </div>
      <Controls state={treeStore} />
    </div>
  );
};
