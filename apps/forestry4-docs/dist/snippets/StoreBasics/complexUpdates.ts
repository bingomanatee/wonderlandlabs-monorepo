// Auto-generated snippet from: apps/forestry4-docs/src/examples/store-basics/complex-updates.ts
// Description: Complex update patterns using mutate() with Immer
// Last synced: Mon Sep 22 17:07:23 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// Use mutate() for complex transformations
addTag(tag: string) {
  this.mutate(draft => {
    if (!draft.tags) draft.tags = [];
    draft.tags.push(tag);  // Immer-powered mutations
  });
}

removeTag(tagToRemove: string) {
  this.mutate(draft => {
    draft.tags = draft.tags.filter(tag => tag !== tagToRemove);
  });
}

updateNestedPreference(key: string, value: any) {
  this.mutate(draft => {
    if (!draft.preferences) draft.preferences = {};
    draft.preferences[key] = value;
  });
}
