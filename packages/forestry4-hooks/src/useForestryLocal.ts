import { useEffect, useRef, useState } from 'react'

export interface ForestryLocalStore<ValueType> {
  complete: () => void
  subscribe: (next: (nextValue: ValueType) => void) => {
    unsubscribe?: () => void
  }
  value: ValueType
}

const storeLifetimes = new WeakMap<
  ForestryLocalStore<unknown>,
  {
    cleanupTimer: ReturnType<typeof setTimeout> | null
    refs: number
  }
>()

export default function useForestryLocal<
  ValueType,
  StoreType extends ForestryLocalStore<ValueType>,
  Args extends unknown[] = [],
>(
  factory: (...args: Args) => StoreType,
  ...rest: Args
): [ValueType, StoreType] {
  const [store] = useState(() => factory(...rest))
  const retainedStore = useRef(false)
  const [value, setValue] = useState(store.value)

  useEffect(() => {
    let lifetime = storeLifetimes.get(store)

    if (!lifetime) {
      lifetime = {
        cleanupTimer: null,
        refs: 0,
      }
      storeLifetimes.set(store, lifetime)
    }

    lifetime.refs += 1
    retainedStore.current = true

    if (lifetime.cleanupTimer) {
      clearTimeout(lifetime.cleanupTimer)
      lifetime.cleanupTimer = null
    }

    const sub = store.subscribe((nextValue) => {
      setValue(nextValue)
    })

    return () => {
      sub?.unsubscribe?.()

      const currentLifetime = storeLifetimes.get(store)

      if (!currentLifetime || !retainedStore.current) {
        return
      }

      retainedStore.current = false
      currentLifetime.refs = Math.max(0, currentLifetime.refs - 1)

      if (currentLifetime.refs > 0) {
        return
      }

      currentLifetime.cleanupTimer = setTimeout(() => {
        const latestLifetime = storeLifetimes.get(store)

        if (!latestLifetime || latestLifetime.refs > 0) {
          return
        }

        store.complete()
        storeLifetimes.delete(store)
      }, 1000)
    }
  }, [store])

  return [value, store]
}
