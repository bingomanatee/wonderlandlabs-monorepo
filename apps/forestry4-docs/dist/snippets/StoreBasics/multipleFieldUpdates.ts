// Auto-generated snippet from: apps/forestry4-docs/src/examples/store-basics/multiple-field-updates.ts
// Description: Multiple field update patterns with modern class methods
// Last synced: Mon Sep 22 17:07:23 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// Modern Forestry 4.1.x class methods for multiple field updates
updateProfile(updates: Partial<UserState>) {
  this.mutate(draft => {
    Object.assign(draft, updates);  // Merge multiple fields with Immer
  });
}

reset() {
  this.next({  // Replace entire value
    name: 'John Doe',
    age: 30,
    email: 'john@example.com'
  });
}
