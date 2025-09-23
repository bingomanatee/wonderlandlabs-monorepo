// Auto-generated snippet from: apps/forestry4-docs/src/hooks/useForestryLocal.ts
// Description: Local Store Management Hook - Creates and manages store instances
// Last synced: Mon Sep 23 2025
// DO NOT EDIT - This file is automatically synced from the source

import { useEffect, useRef, useState } from 'react';
import type { StoreIF } from '@wonderlandlabs/forestry4';
import { Forest } from '@wonderlandlabs/forestry4';

export default function useForestryLocal<ValueType, StoreType = Forest<ValueType>>(
  factory: () => StoreType,
  ...rest: any[]
): [ValueType, StoreIF<ValueType>] {
  const store = useRef<StoreType | null>(null);
  store.current ||= factory(...rest);

  const [value, setValue] = useState(store.current?.value);
  useEffect(() => {
    if (store.current) {
      let sub = store.current?.subscribe(setValue);

      return () => {
        sub?.unsubscribe();
      };
    }
  }, []);

  return [value, store.current];
}
