// Auto-generated snippet from: apps/forestry4-docs/src/snippets/home/react-integration.tsx
// Description: React integration example for Forestry 4
// Last synced: Sun Sep 14 22:42:19 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

import React, { useState, useEffect } from 'react';
import { Store } from '@wonderlandlabs/forestry4';

const Counter: React.FC = () => {
  const [count, setCount] = useState(0);
  const [store] = useState(() => new Store({
    name: 'counter',
    value: { count: 0 },
    actions: {
      increment: (state) => ({ ...state, count: state.count + 1 }),
      decrement: (state) => ({ ...state, count: state.count - 1 }),
    }
  }));

  useEffect(() => {
    const subscription = store.subscribe(state => {
      setCount(state.count);
    });
    return () => subscription.unsubscribe();
  }, [store]);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => store.$.increment()}>+</button>
      <button onClick={() => store.$.decrement()}>-</button>
    </div>
  );
};
