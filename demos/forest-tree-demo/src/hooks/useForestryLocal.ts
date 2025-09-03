import { useEffect, useRef, useState } from 'react';
import type { StoreIF } from '@wonderlandlabs/forestry4';

export default function useForestryLocal<ValueType>(
  factory: () => StoreIF<ValueType>,
  ...rest: any[]
): [ValueType, StoreIF<ValueType>] {
  const state = useRef<StoreIF<ValueType> | null>(null);
  state.current ||= factory(...rest);

  const [value, setValue] = useState(state.current?.value);

  useEffect(() => {
    if (state.current) {
      const sub = state.current.subscribe(setValue);

      return () => {
        sub?.unsubscribe();
      };
    }
  }, []);

  return [value, state.current];
}
