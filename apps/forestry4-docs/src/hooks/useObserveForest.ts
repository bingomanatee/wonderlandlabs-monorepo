import { useEffect, useState } from 'react';
import type { StoreIF } from '@wonderlandlabs/forestry4';

export default function useObserveForest<ValueType>(
  store: StoreIF<ValueType>
): ValueType {
  const [value, setValue] = useState(store.value);
  useEffect(() => {
    let sub = store.subscribe(setValue);

    return () => {
      sub?.unsubscribe();
    };
  }, [store]);

  return value;
}
