// Auto-generated snippet from: apps/forestry4-docs/src/examples/home/react-integration.tsx
// Description: React integration example for Forestry 4
// Last synced: Sat Sep 20 19:53:28 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

import React from 'react';
import { Forest } from '@wonderlandlabs/forestry4';
import useForestryLocal from '../../hooks/useForestryLocal';

// Modern Forestry 4.1.x class extension pattern
class CounterForest extends Forest<{ count: number }> {
  constructor() {
    super({
      name: 'counter',
      value: { count: 0 },
    });
  }

  increment() {
    this.mutate(draft => {
      draft.count += 1;
    });
  }

  decrement() {
    this.mutate(draft => {
      draft.count -= 1;
    });
  }
}

const counterForestFactory = () => new CounterForest();

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
