// Auto-generated snippet from: apps/forestry4-docs/public/snippets/home/demo-store-definition.ts
// Description: Demo store definition for home page live demo
// Last synced: Mon Sep 15 11:35:45 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// Auto-generated snippet from: apps/forestry4-docs/src/snippets/home/demo-store-definition.ts
// Description: Demo store definition for home page live demo
// Last synced: Mon Sep 15 11:30:49 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// Auto-generated snippet from: apps/forestry4-docs/src/snippets/home/demo-store-definition.ts
// Description: Demo store definition for home page live demo
// Last synced: Mon Sep 15 11:28:25 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// Auto-generated snippet from: apps/forestry4-docs/src/snippets/home/demo-store-definition.ts
// Description: Demo store definition for home page live demo
// Last synced: Mon Sep 15 11:24:39 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// Auto-generated snippet from: apps/forestry4-docs/src/snippets/home/demo-store-definition.ts
// Description: Demo store definition for home page live demo
// Last synced: Sun Sep 14 22:42:19 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// Create the counter store
const counterStore = new Store({
  name: 'demo-counter',
  value: { count: 0 },
  actions: {
    increment: function(value: { count: number }) {
      this.next({ ...value, count: value.count + 1 });
    },
    decrement: function(value: { count: number }) {
      this.next({ ...value, count: value.count - 1 });
    },
    reset: function() {
      this.next({ count: 0 });
    },
  },
})
