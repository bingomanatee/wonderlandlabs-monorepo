// Auto-generated snippet from: apps/forestry4-docs/src/snippets/home/basic-usage.ts
// Description: Basic usage example for Forestry 4
// Last synced: Sun Sep 14 22:42:19 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

import { Store } from '@wonderlandlabs/forestry4';

const store = new Store({
  name: 'counter',
  value: { count: 0 },
  actions: {
    increment: function(value) {
      this.next({ ...value, count: value.count + 1 });
    },
    decrement: function(value) {
      this.next({ ...value, count: value.count - 1 });
    },
    reset: function() {
      this.next({ count: 0 });
    }
  }
});

// Subscribe to changes
store.subscribe(state => {
  console.log('Count:', state.count);
});

// Use actions
store.$.increment();
store.$.decrement();
store.$.reset();
