// Auto-generated snippet from: apps/forestry4-docs/src/hooks/useForestryLocal.ts
// Description: useForestryLocal hook implementation for React integration
// Last synced: Mon Sep 15 12:00:11 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

import { useEffect, useRef, useState } from 'react';
import type { StoreIF } from '@wonderlandlabs/forestry4';

export default function useForestryLocal<ValueType>(
  factory: () => StoreIF<ValueType>,
  ...rest: any[]
): [ValueType, StoreIF<ValueType>] {
  const store = useRef<StoreIF<ValueType> | null>(null);
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
