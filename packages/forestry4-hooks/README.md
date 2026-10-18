# @wonderlandlabs/forestry4-hooks

React hooks for binding Forestry stores to components.

## Install

```sh
npm install @wonderlandlabs/forestry4-hooks @wonderlandlabs/forestry4
```

`react` and `@wonderlandlabs/forestry4` are peer dependencies.

## Exports

```ts
import {
  useForestryGlobal,
  useForestryLocal,
  useObserveForest,
} from '@wonderlandlabs/forestry4-hooks'
```

## Core APIs

### `useObserveForest(store, filter?)`

Subscribes to a Forestry `Forest` and returns the current value.
Importantly you can observe specific subsets of properties to reduce
churn.

```tsx
import { useObserveForest } from '@wonderlandlabs/forestry4-hooks'

function CounterView({ counterStore }: { counterStore: CounterStore }) {
  const count = useObserveForest(counterStore, (value) => value.count)

  return <button onClick={counterStore.$.increment}>{count}</button>
}
```

Use this when a component receives a store instance from props, context, or
another hook. The optional `filter` selects a derived value. The hook avoids
state updates when the selected value is unchanged by `Object.is`, or when a
selected plain object is shallow-equal.

### `useForestryLocal(factory, ...args)`

Creates one component-local store and returns `[value, store]`.
This "useState killer" creates a transient Forestry instance for the lifespan
of the component.

```tsx
import { Forest } from '@wonderlandlabs/forestry4'
import { useForestryLocal } from '@wonderlandlabs/forestry4-hooks'

interface CounterValue {
  count: number
}

class CounterStore extends Forest<CounterValue> {
  static create(initialCount = 0) {
    return new CounterStore({ value: { count: initialCount } })
  }

  increment() {
    this.next({ count: this.value.count + 1 })
  }
}

function Counter() {
  const [value, store] = useForestryLocal(CounterStore.create, 0)

  return <button onClick={store.$.increment}>{value.count}</button>
}
```

Use this for stores owned by a component or provider. The factory only runs for
the component's initial state. On unmount, the hook unsubscribes immediately and
calls `store.complete()` after a short grace period if no other mounted hook is
retaining the same store.

### `useForestryGlobal(source, filter?)`

Reads a singleton store source and returns `[value, store]`.

```tsx
import { Forest } from '@wonderlandlabs/forestry4'
import { useForestryGlobal } from '@wonderlandlabs/forestry4-hooks'

const counterSource = {
  singleton: new CounterStore({ value: { count: 0 } }),
}

function GlobalCounter() {
  const [count, store] = useForestryGlobal(
    counterSource,
    (value) => value.count,
  )

  return <button onClick={store.$.increment}>{count}</button>
}
```

Use this for module-level or application-level singleton stores. The source must
have a `singleton` property containing the `Forest` instance. The optional
`filter` behaves the same as `useObserveForest`.

## Types

```ts
import type {
  ForestryGlobalSource,
  ForestryLocalStore,
} from '@wonderlandlabs/forestry4-hooks'
```

`ForestryLocalStore<ValueType>` is the minimum store shape accepted by
`useForestryLocal`: `value`, `subscribe()`, and `complete()`.

`ForestryGlobalSource<StoreType>` is the source shape accepted by
`useForestryGlobal`: `{ readonly singleton: StoreType }`.
