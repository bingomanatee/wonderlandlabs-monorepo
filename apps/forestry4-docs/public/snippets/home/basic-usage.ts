// Auto-generated snippet from: apps/forestry4-docs/src/examples/home/basic-usage.ts
// Description: Basic usage example for Forestry 4
// Last synced: Mon Sep 22 17:07:21 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

import { Forest } from '@wonderlandlabs/forestry4';

export type CounterValue = { count: number };
// Modern Forestry 4.1.x class extension pattern
export class CounterForest extends Forest<CounterValue> {
  constructor() {
    super({
      name: 'counter',
      value: { count: 0 },
    });
  }

  increment() {
    this.mutate((draft: CounterValue) => {
      draft.count += 1;
    });
  }

  decrement() {
    this.mutate((draft: CounterValue) => {
      draft.count -= 1;
    });
  }

  reset() {
    this.mutate((draft) => {
      draft.count = 0;
    });
  }
}

// Create an instance
const counterForest = new CounterForest();

// Subscribe to changes
counterForest.subscribe((state) => {
  console.log('Count:', state.count);
});

// Store Method aliases - bound to store context;

counterForest.$.increment();
counterForest.$.decrement();
counterForest.$.reset();
