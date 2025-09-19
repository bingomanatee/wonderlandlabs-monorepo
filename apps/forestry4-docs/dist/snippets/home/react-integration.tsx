// Auto-generated snippet from: apps/forestry4-docs/src/examples/home/react-integration.tsx
// Description: React integration example for Forestry 4
// Last synced: Thu Sep 18 21:57:37 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

import React from 'react';
import { Forest } from '@wonderlandlabs/forestry4';
import useForestryLocal from '../../hooks/useForestryLocal';

const counterForestFactory = () => new Forest({
  name: 'counter',
  value: { count: 0 },
  actions: {
    increment(value) {
      this.mutate(draft => {
        draft.count += 1;
      });
    },
    decrement(value) {
      this.mutate(draft => {
        draft.count -= 1;
      });
    }
  }
});

const Counter: React.FC = () => {
  const [value, forest] = useForestryLocal(counterForestFactory);
  const { count } = value;

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={forest.$.increment}>+</button>
      <button onClick={forest.$.decrement}>-</button>
    </div>
  );
};
