// Auto-generated snippet from: apps/forestry4-docs/src/storeFactories/homeDemoStoreFactory.ts
// Description: Demo store definition for home page live demo
// Last synced: Thu Sep 18 21:57:37 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

import { Forest } from '@wonderlandlabs/forestry4';

// Forest factory for the home page counter demo
export const homeDemoStoreFactory = () => new Forest({
  name: 'demo-counter',
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
    },
  },
});

export default homeDemoStoreFactory;
