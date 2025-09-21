// Auto-generated snippet from: apps/forestry4-docs/src/examples/home/basic-usage.ts
// Description: Basic usage example for Forestry 4
// Last synced: Sun Sep 21 14:32:35 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

import { Forest } from '@wonderlandlabs/forestry4';

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

  reset() {
    this.mutate(draft => {
      draft.count = 0;
    });
  }
}

// Create an instance
const counterForest = new CounterForest();

// Subscribe to changes
counterForest.subscribe(state => {
  console.log('Count:', state.count);
});

// Use actions
counterForest.$.increment();
counterForest.$.decrement();
counterForest.$.reset();
