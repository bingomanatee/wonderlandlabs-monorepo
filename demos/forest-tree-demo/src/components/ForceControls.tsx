import React from 'react';
import type { TreeState } from '../types';

interface ForceControlsProps {
  forceParams: TreeState['forceParams'];
  onUpdateParams: (params: Partial<TreeState['forceParams']>) => void;
  onToggleAnimation: () => void;
  onStep: () => void;
}

export function ForceControls({
  forceParams,
  onUpdateParams,
  onToggleAnimation,
  onStep,
}: ForceControlsProps) {
  return (
    <div id="force-controls" className="force-controls">
      <span style={{ fontWeight: 'bold' }}>Forces:</span>

      <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        Spring:
        <input
          type="number"
          min="0.001"
          max="0.1"
          step="0.001"
          value={forceParams.springStrength}
          onChange={(e) => onUpdateParams({ springStrength: parseFloat(e.target.value) })}
          style={{ width: '60px', fontSize: '11px', padding: '2px' }}
        />
      </label>

      <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        Repulsion:
        <input
          type="number"
          min="1"
          max="200"
          step="1"
          value={forceParams.repulsionStrength}
          onChange={(e) => onUpdateParams({ repulsionStrength: parseFloat(e.target.value) })}
          style={{ width: '50px', fontSize: '11px', padding: '2px' }}
        />
      </label>

      <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        Gravity:
        <input
          type="number"
          min="0"
          max="0.02"
          step="0.0001"
          value={forceParams.upwardGravity}
          onChange={(e) => onUpdateParams({ upwardGravity: parseFloat(e.target.value) })}
          style={{ width: '60px', fontSize: '11px', padding: '2px' }}
        />
      </label>

      <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        Damping:
        <input
          type="number"
          min="0.8"
          max="0.99"
          step="0.001"
          value={forceParams.damping}
          onChange={(e) => onUpdateParams({ damping: parseFloat(e.target.value) })}
          style={{ width: '50px', fontSize: '11px', padding: '2px' }}
        />
      </label>

      <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        MaxDist:
        <input
          type="number"
          min="10"
          max="200"
          step="5"
          value={forceParams.maxDistance}
          onChange={(e) => onUpdateParams({ maxDistance: parseFloat(e.target.value) })}
          style={{ width: '50px', fontSize: '11px', padding: '2px' }}
        />
      </label>

      <button
        onClick={onToggleAnimation}
        style={{
          padding: '2px 8px',
          backgroundColor: forceParams.animating ? '#ff6b6b' : '#51cf66',
          color: 'white',
          border: 'none',
          borderRadius: '3px',
          cursor: 'pointer',
          fontSize: '11px',
        }}
      >
        {forceParams.animating ? 'Stop' : 'Start'}
      </button>

      <button
        onClick={onStep}
        disabled={forceParams.animating}
        style={{
          padding: '2px 8px',
          backgroundColor: forceParams.animating ? '#ccc' : '#339af0',
          color: 'white',
          border: 'none',
          borderRadius: '3px',
          cursor: forceParams.animating ? 'not-allowed' : 'pointer',
          fontSize: '11px',
        }}
      >
        Step
      </button>
    </div>
  );
}
