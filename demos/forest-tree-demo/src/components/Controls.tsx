import type { TreeState } from '../types.ts';
import React from 'react';
import useObserveForest from '../hooks/useObserveForest.ts';
import type { StoreIF } from '@wonderlandlabs/forestry4';
import style from './Controls.module.css';

export default function Controls({ state }: { state: StoreIF<TreeState> }) {
  const treeState = useObserveForest<TreeState>(state);
  return (
    <div className={style.controls}>
      <div className={style['season-controls']}>
        <label>Season: </label>
        {(['spring', 'summer', 'autumn', 'winter'] as const).map((season) => (
          <button
            key={season}
            data-season={season}
            onClick={state.acts.setSeason}
            className={treeState.season === season ? 'active' : ''}
          >
            {season}
          </button>
        ))}
      </div>
    </div>
  );
}
