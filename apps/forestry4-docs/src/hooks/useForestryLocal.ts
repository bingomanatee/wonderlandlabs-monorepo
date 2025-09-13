import { useEffect, useRef, useState } from 'react';
import type { CollectionIF } from '@wonderlandlabs/forestry/build/src/types/types.collections';

export default function useForestryLocal<ValueType>(
  factory: () => CollectionIF<ValueType>,
  ...rest
): [ValueType, CollectionIF<ValueType>] {
  const state = useRef<CollectionIF<ValueType> | null>(null);
  state.current ||= factory(...rest);

  const [value, setValue] = useState(state.current?.value);
  useEffect(() => {
    if (state.current) {
      let sub = state.current?.subscribe(setValue);

      return () => {
        sub?.unsubscribe();
      };
    }
  }, []);

  return [value, state.current];
}
