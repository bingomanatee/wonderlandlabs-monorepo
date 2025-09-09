import React from 'react';
import type { StoreIF } from '@wonderlandlabs/forestry4';
import type { TreeStoreData } from '../managers/forestDataStore';
import styles from './Controls.module.css';

interface ControlsProps {
  state: StoreIF<TreeStoreData>;
}

export default function Controls({ state }: ControlsProps) {
  const handleRegenerateTree = () => {
    // Get current canvas dimensions from PIXI app if available
    const pixiApp = state.res.get('pixiApp');
    const width = pixiApp?.screen.width || 800;
    const height = pixiApp?.screen.height || 600;

    // Generate new tree
    const rootId = state.acts.generateTree(width, height);

    // If physics exists, recreate root pin
    const physics = state.res.get('physics');
    if (physics && physics.createRootPin) {
      physics.createRootPin(rootId);
    }
  };

  const handleApplyWind = () => {
    // Apply some wind force
    const physics = state.res.get('physics');
    if (physics && physics.applyWind) {
      physics.applyWind({ x: Math.random() * 0.01 - 0.005, y: 0 });
    }
  };

  const handleResetWind = () => {
    // Reset wind forces
    const physics = state.res.get('physics');
    if (physics && physics.applyWind) {
      physics.applyWind({ x: 0, y: 0 });
    }
  };

  const handleSeasonChange = (season: string) => {
    // Update background based on season
    const backgroundGraphics = state.res.get('backgroundGraphics');
    const pixiApp = state.res.get('pixiApp');

    if (backgroundGraphics && pixiApp) {
      // Re-render background with new season
      const { renderBackground } = require('../utils/pixiGraphics');
      renderBackground(backgroundGraphics, pixiApp, season);
    }
  };

  return (
    <div className={styles.controls}>
      <h3>Tree Controls</h3>

      <button
        onClick={handleRegenerateTree}
        className={`${styles.button} ${styles.generateButton}`}
      >
        Generate New Tree
      </button>

      <div>
        <h4>Wind Effects</h4>

        <div className={styles.windControls}>
          <button
            onClick={handleApplyWind}
            className={`${styles.button} ${styles.windButton}`}
          >
            Apply Wind
          </button>

          <button
            onClick={handleResetWind}
            className={`${styles.button} ${styles.resetButton}`}
          >
            Reset Wind
          </button>
        </div>
      </div>

      <div>
        <h4>Seasons</h4>

        <div className={styles.windControls}>
          {(['spring', 'summer', 'autumn', 'winter'] as const).map((season) => (
            <button
              key={season}
              onClick={() => handleSeasonChange(season)}
              className={`${styles.button} ${styles.windButton}`}
              style={{ fontSize: '11px', padding: '6px 8px' }}
            >
              {season}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.instructions}>
        <p><strong>Status:</strong></p>
        <p>• Nodes: {state.value.nodes.size}</p>
        <p>• Constraints: {state.value.constraints.size}</p>
        <p>• Root ID: {state.value.rootId || 'None'}</p>
      </div>

      <div className={styles.instructions}>
        <p><strong>Instructions:</strong></p>
        <p>• Click "Generate New Tree" to create a new tree structure</p>
        <p>• Use wind controls to see physics effects</p>
        <p>• Change seasons to see different backgrounds</p>
        <p>• Tree uses Matter.js physics with PIXI.js rendering</p>
      </div>
    </div>
  );
}
