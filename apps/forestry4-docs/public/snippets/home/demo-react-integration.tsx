// Auto-generated snippet from: apps/forestry4-docs/public/snippets/home/demo-react-integration.tsx
// Description: Demo React integration for home page live demo
// Last synced: Thu Sep 18 21:57:37 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// Auto-generated snippet from: apps/forestry4-docs/public/snippets/home/demo-react-integration.tsx
// Description: Demo React integration for home page live demo
// Last synced: Thu Sep 18 21:50:06 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// Auto-generated snippet from: apps/forestry4-docs/public/snippets/home/demo-react-integration.tsx
// Description: Demo React integration for home page live demo
// Last synced: Mon Sep 15 14:19:17 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// Auto-generated snippet from: apps/forestry4-docs/public/snippets/home/demo-react-integration.tsx
// Description: Demo React integration for home page live demo
// Last synced: Mon Sep 15 12:00:11 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// Auto-generated snippet from: apps/forestry4-docs/public/snippets/home/demo-react-integration.tsx
// Description: Demo React integration for home page live demo
// Last synced: Mon Sep 15 11:57:58 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// Auto-generated snippet from: apps/forestry4-docs/public/snippets/home/demo-react-integration.tsx
// Description: Demo React integration for home page live demo
// Last synced: Mon Sep 15 11:55:05 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// Auto-generated snippet from: apps/forestry4-docs/public/snippets/home/demo-react-integration.tsx
// Description: Demo React integration for home page live demo
// Last synced: Mon Sep 15 11:54:35 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// Auto-generated snippet from: apps/forestry4-docs/public/snippets/home/demo-react-integration.tsx
// Description: Demo React integration for home page live demo
// Last synced: Mon Sep 15 11:53:31 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// Auto-generated snippet from: apps/forestry4-docs/public/snippets/home/demo-react-integration.tsx
// Description: Demo React integration for home page live demo
// Last synced: Mon Sep 15 11:35:45 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// Auto-generated snippet from: apps/forestry4-docs/src/snippets/home/demo-react-integration.tsx
// Description: Demo React integration for home page live demo
// Last synced: Mon Sep 15 11:30:49 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// Auto-generated snippet from: apps/forestry4-docs/src/snippets/home/demo-react-integration.tsx
// Description: Demo React integration for home page live demo
// Last synced: Mon Sep 15 11:28:25 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// Auto-generated snippet from: apps/forestry4-docs/src/snippets/home/demo-react-integration.tsx
// Description: Demo React integration for home page live demo
// Last synced: Mon Sep 15 11:24:39 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// Auto-generated snippet from: apps/forestry4-docs/src/snippets/home/demo-react-integration.tsx
// Description: Demo React integration for home page live demo
// Last synced: Sun Sep 14 22:42:19 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// Store factory (defined in Store Definition tab)
const counterStoreFactory = () => new Store({
  name: 'counter',
  value: { count: 0 },
  actions: {
    increment(value) {
      this.mutate(draft => {
        draft.count += 1;
      });
    },
    decrement(value) {
      this.mutate(draft => {
        draft.count -= 1;
      });
    },
    reset(value) {
      this.mutate(draft => {
        draft.count = 0;
      });
    }
  }
});

// React component using useForestryLocal hook
const { value: { count }, store } = useForestryLocal(counterStoreFactory)

// Actions can be called directly in JSX - no wrapper functions needed!
