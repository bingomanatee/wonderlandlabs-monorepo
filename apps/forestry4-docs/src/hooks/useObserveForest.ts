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
      }
  },[collection]);

  return value;
}