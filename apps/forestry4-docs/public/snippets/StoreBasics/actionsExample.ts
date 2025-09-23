// Auto-generated snippet from: apps/forestry4-docs/src/examples/store-basics/actions-example.ts
// Description: Modern class methods example (replaces actions object)
// Last synced: Mon Sep 22 17:07:23 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// Modern Forestry 4.1.x class methods (not actions object)
setName(name: string) {
  this.mutate(draft => {
    draft.name = name;
  });
}
