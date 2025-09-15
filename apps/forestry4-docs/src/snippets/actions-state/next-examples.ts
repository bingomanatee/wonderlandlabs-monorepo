// Auto-generated snippet from: apps/forestry4-docs/src/snippets/actions-state/next-examples.ts
// Description: Examples of using the next method for complete state replacement
// Last synced: Sun Sep 14 22:42:19 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// Auto-generated snippet from: apps/forestry4-docs/src/snippets/actions-state/next-examples.ts
// Description: Examples of using the next method for complete state replacement
// Last synced: Sun Sep 14 21:52:27 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// Auto-generated snippet from: apps/forestry4-docs/src/snippets/actions-state/next-examples.ts
// Description: Examples of using the next method for complete state replacement
// Last synced: Sun Sep 14 20:56:05 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// Complete state replacement
this.next({ 
  count: 0, 
  items: [], 
  status: 'reset' 
});

// Useful for simple states
this.next(42); // For number state

// Reset to initial state
this.next(this.initialValue);
