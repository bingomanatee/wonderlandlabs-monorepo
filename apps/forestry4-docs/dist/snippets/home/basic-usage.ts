// Auto-generated snippet from: apps/forestry4-docs/src/examples/home/basic-usage.ts
// Description: Basic usage example for Forestry 4
// Last synced: Mon Sep 15 14:19:17 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

import { Forest } from '@wonderlandlabs/forestry4';

const forest = new Forest({
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
    },
    reset(value) {
      this.mutate(draft => {
        draft.count = 0;
      });
    }
  }
});

// Subscribe to changes
forest.subscribe(state => {
  console.log('Count:', state.count);
});

// Use actions
forest.$.increment();
forest.$.decrement();
forest.$.reset();
