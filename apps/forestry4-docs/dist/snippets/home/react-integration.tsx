// Auto-generated snippet from: apps/forestry4-docs/public/snippets/home/react-integration.tsx
// Description: React integration example for Forestry 4
// Last synced: Mon Sep 15 11:35:45 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// Auto-generated snippet from: apps/forestry4-docs/src/snippets/home/react-integration.tsx
// Description: React integration example for Forestry 4
// Last synced: Mon Sep 15 11:30:49 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// Auto-generated snippet from: apps/forestry4-docs/src/snippets/home/react-integration.tsx
// Description: React integration example for Forestry 4
// Last synced: Mon Sep 15 11:28:25 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// Auto-generated snippet from: apps/forestry4-docs/src/snippets/home/react-integration.tsx
// Description: React integration example for Forestry 4
// Last synced: Mon Sep 15 11:24:39 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// Auto-generated snippet from: apps/forestry4-docs/src/snippets/home/react-integration.tsx
// Description: React integration example for Forestry 4
// Last synced: Sun Sep 14 22:42:19 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

import React from 'react';
import { Store } from '@wonderlandlabs/forestry4';
import { useForestryLocal } from '../hooks/useForestryLocal';

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
    }
  }
});

const Counter: React.FC = () => {
  const { value: { count }, store } = useForestryLocal(counterStoreFactory);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={store.$.increment}>+</button>
      <button onClick={store.$.decrement}>-</button>
    </div>
  );
};
