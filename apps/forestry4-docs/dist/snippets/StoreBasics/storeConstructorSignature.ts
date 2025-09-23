// Auto-generated snippet from: apps/forestry4-docs/src/examples/store-basics/store-constructor-signature.ts
// Description: Modern Forestry 4.1.x constructor signature
// Last synced: Mon Sep 22 17:07:23 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

import { Forest } from '@wonderlandlabs/Forestry4';
import type { ForestConfig } from '@wonderlandlabs/forestry4';

type Item = {
  id: number;
  name: string;
};
type Items = {
  items: Item[];
};
export default class MyStore extends Forest<Items> {
  constructor() {
    // update / mutate config
    super({
      value: { items: [] },
    });
  }

  addItem(item: Item) {
    this.mutate((value) => {
      value.items.push(item);
    });
  }

  get count() {
    return this.value.items.length;
  }
}
