import { useEffect, useRef, useState } from 'react';
import type { StoreIF } from '@wonderlandlabs/forestry4';

/**
 * Hook for creating and managing Forest branches
 * @param store - The parent Forest store
 * @param path - The path for the branch (e.g., 'username', 'email')
 * @param storeParams - Partial store parameters for the branch (actions, tests, prep, etc.)
 * @returns [branchValue, branchStore] - The branch value and store instance
 */
export default function useForestBranch<ValueType>(
  store: StoreIF<any>,
  path: string,
  storeParams: Partial<{
    actions: Record<string, Function>;
    tests: Array<(value: ValueType) => string | null>;
    prep: (input: Partial<ValueType>, current: ValueType) => ValueType;
    name?: string;
  }>
): [ValueType, StoreIF<ValueType>] {
  const branchRef = useRef<StoreIF<ValueType> | null>(null);
  
  // Create branch if it doesn't exist
  if (!branchRef.current && store && typeof (store as any).branch === 'function') {
    branchRef.current = (store as any).branch(path, storeParams);
  }

  const [value, setValue] = useState<ValueType>(
    branchRef.current?.value
  );

  useEffect(() => {
    if (branchRef.current) {
      const sub = branchRef.current.subscribe(setValue);

      return () => {
        sub?.unsubscribe();
      };
    }
  }, [branchRef.current]);

  return [value, branchRef.current!];
}
