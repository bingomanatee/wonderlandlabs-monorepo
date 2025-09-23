// Auto-generated snippet from: apps/forestry4-docs/src/examples/api-reference/nextExample.ts
// Description: Forest next() method examples for updating values
// Last synced: Mon Sep 22 17:07:22 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// Updating Forest Values with next()
const userStore = new UserForest({
  name: 'John',
  age: 25,
  email: 'john@example.com'
});

// Update single field
userStore.next({ age: 26 });

// Update multiple fields
userStore.next({ 
  name: 'John Doe',
  email: 'john.doe@example.com' 
});

// Partial updates - other fields remain unchanged
userStore.next({ age: 27 }); // name and email stay the same
