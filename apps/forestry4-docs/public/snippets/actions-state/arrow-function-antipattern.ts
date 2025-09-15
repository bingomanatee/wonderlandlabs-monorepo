// Auto-generated snippet from: apps/forestry4-docs/src/snippets/actions-state/arrow-function-antipattern.ts
// Description: Example showing why arrow functions don't work as actions
// Last synced: Sun Sep 14 21:52:27 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// Auto-generated snippet from: apps/forestry4-docs/src/snippets/actions-state/arrow-function-antipattern.ts
// Description: Example showing why arrow functions don't work as actions
// Last synced: Sun Sep 14 20:56:05 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

const foo = new Store({
  value: 1, 
  actions: {
    increment: () => this.value = this.value + 1 // ❌ Won't work!
  }
});
