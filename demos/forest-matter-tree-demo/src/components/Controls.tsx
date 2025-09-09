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

  const handleSeasonChange = (season: 'spring' | 'summer' | 'autumn' | 'winter') => {
    // Update season in store (this also updates colors and triggers redraw)
    state.acts.setSeason(season);
  };

  return (
    <div className={styles.controls}>
      <button
        onClick={handleRegenerateTree}
        className={`${styles.button} ${styles.generateButton}`}
        style={{ display: 'none' }}
      >
        Generate New Tree
      </button>

      <div>
        <h4>Seasons</h4>

        <div className={styles.windControls}>
          {(['spring', 'summer', 'autumn', 'winter'] as const).map((season) => (
            <button
              key={season}
              onClick={() => handleSeasonChange(season)}
              className={`${styles.button} ${styles.windButton}`}
              style={{
                fontSize: '11px',
                padding: '6px 8px',
                border: state.value.season === season ? '2px solid white' : 'none',
              }}
            >
              {season}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
