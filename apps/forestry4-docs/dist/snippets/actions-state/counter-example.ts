// Auto-generated snippet from: apps/forestry4-docs/public/snippets/actions-state/counter-example.ts
// Description: Counter store example showing action parameters
// Last synced: Mon Sep 15 12:00:11 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// Auto-generated snippet from: apps/forestry4-docs/public/snippets/actions-state/counter-example.ts
// Description: Counter store example showing action parameters
// Last synced: Mon Sep 15 11:57:58 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// Auto-generated snippet from: apps/forestry4-docs/public/snippets/actions-state/counter-example.ts
// Description: Counter store example showing action parameters
// Last synced: Mon Sep 15 11:55:04 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// Auto-generated snippet from: apps/forestry4-docs/public/snippets/actions-state/counter-example.ts
// Description: Counter store example showing action parameters
// Last synced: Mon Sep 15 11:54:35 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// Auto-generated snippet from: apps/forestry4-docs/public/snippets/actions-state/counter-example.ts
// Description: Counter store example showing action parameters
// Last synced: Mon Sep 15 11:53:31 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// Auto-generated snippet from: apps/forestry4-docs/public/snippets/actions-state/counter-example.ts
// Description: Counter store example showing action parameters
// Last synced: Mon Sep 15 11:35:44 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// Auto-generated snippet from: apps/forestry4-docs/src/snippets/actions-state/counter-example.ts
// Description: Counter store example showing action parameters
// Last synced: Sun Sep 14 21:52:27 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// Auto-generated snippet from: apps/forestry4-docs/src/snippets/actions-state/counter-example.ts
// Description: Counter store example showing action parameters
// Last synced: Sun Sep 14 20:56:04 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

const counter = new Store({
  value: 1,
  actions: {
    add(value, num) {
      this.next(value + num);
    }
  }
});

counter.subscribe((v) => console.log('counter is', v)); // 'counter is 1'
counter.add(3); // note no value parameter; 'counter is 4'
