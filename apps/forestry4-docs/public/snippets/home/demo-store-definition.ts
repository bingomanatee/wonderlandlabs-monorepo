// Auto-generated snippet from: apps/forestry4-docs/src/storeFactories/homeDemoStoreFactory.ts
// Description: Demo store definition for home page live demo
// Last synced: Mon Sep 22 17:07:21 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

import { Forest } from '@wonderlandlabs/forestry4';

export type CountType = { count: number };
// Modern Forestry 4.1.x class extension pattern
class HomeDemoForest extends Forest<CountType> {
  constructor() {
    super({
      name: 'demo-counter',
      value: { count: 0 },
    });
  }

  increment() {
    this.mutate((draft: CountType) => {
      draft.count += 1;
    });
  }

  decrement() {
    this.mutate((draft: CountType) => {
      draft.count -= 1;
    });
  }

  reset() {
    this.mutate((draft) => {
      draft.count = 0;
    });
  }
}

// Forest factory for the home page counter demo
export const homeDemoStoreFactory = () => new HomeDemoForest();

export default homeDemoStoreFactory;
