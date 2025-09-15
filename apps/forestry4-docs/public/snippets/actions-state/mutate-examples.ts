// Auto-generated snippet from: apps/forestry4-docs/src/snippets/actions-state/mutate-examples.ts
// Description: Examples of using the mutate method with Immer
// Last synced: Sun Sep 14 21:52:27 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// Auto-generated snippet from: apps/forestry4-docs/src/snippets/actions-state/mutate-examples.ts
// Description: Examples of using the mutate method with Immer
// Last synced: Sun Sep 14 20:56:04 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// Direct mutation of draft object
this.mutate((draft) => {
  draft.items.push({ id: 4, name: 'New Item' });
  draft.count += 1;
  delete draft.tempData;
});

// Can return new value (optional)
this.mutate((draft) => {
  return { ...draft, status: 'updated' };
});

// Array operations
this.mutate((draft) => {
  draft.todos.splice(index, 1); // Remove item
  draft.todos[0].completed = true; // Update item
});
