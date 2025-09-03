import React, { useEffect, useRef } from 'react';
import type { TreeState } from '../types';
import useForestryLocal from '../hooks/useForestryLocal';
import { createTreeState } from '../state/createTreeState';

// Tree state factory is now in separate file

export const Tree: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Use hook to create and observe tree forest (Pixi created internally)
  const [treeState, treeForest] = useForestryLocal<TreeState>(createTreeState);

  const { windForce } = treeState;

  // Animation loop for wind and time
  useEffect(() => {
    const interval = setInterval(() => {
      // Update time using action
      treeForest.acts.tick();

      // Update wind toward current mouse position using action
      treeForest.acts.updateWindToward();

      // Render tree using state action
      treeForest.acts.renderTree();
    }, 50); // 20 FPS

    return () => clearInterval(interval);
  }, [treeForest]);

  // All resize handling, mouse events, and rendering now managed by state

  const handleSeasonChange = (season: TreeState['season']) => {
    treeForest.acts.setSeason(season);
  };

  return (
    <div
      className="tree-container"
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        className="controls"
        style={{
          flexShrink: 0,
          padding: '1rem',
          borderBottom: '1px solid #ddd',
        }}
      >
        <h3>Forest Tree Demo - Move mouse over tree for wind effects!</h3>
        <div className="season-controls">
          <label>Season: </label>
          {(['spring', 'summer', 'autumn', 'winter'] as const).map((season) => (
            <button
              key={season}
              onClick={() => handleSeasonChange(season)}
              className={treeState.season === season ? 'active' : ''}
            >
              {season}
            </button>
          ))}
        </div>
      </div>

      <div
        className="tree-area"
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          ref={containerRef}
          id="tree-container"
          style={{
            width: '100%',
            height: '100%',
            border: '2px solid #8B4513',
            borderRadius: '8px',
            display: 'block',
          }}
        />

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
    </div>
  );
};
