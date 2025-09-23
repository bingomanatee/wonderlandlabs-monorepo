// Auto-generated snippet from: apps/forestry4-docs/src/hooks/useObserveForest.ts
// Description: External Store Observation Hook - Observes existing store instances
// Last synced: Mon Sep 23 2025
// DO NOT EDIT - This file is automatically synced from the source

import { useEffect, useState } from 'react';
import type { CollectionIF } from '@wonderlandlabs/forestry/build/src/types/types.collections';

export default function useObserveForest<ValueType>(
  collection: CollectionIF<ValueType>
): ValueType {
  const [value, setValue] = useState(collection);
  useEffect(() => {
    let sub = collection.observe(setValue);

    return () => {
      sub?.unsubscribe();
    };
  }, [collection]);

  return value;
}
