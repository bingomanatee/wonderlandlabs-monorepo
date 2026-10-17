import { modelSocketStatus } from './constants.js'
import type {
  CollectionBaseValue,
  CollectionKey,
  ItemKey,
  DataManagerValue,
  ModelSocketState,
} from './types.js'

export function createEmptyModelSocketState(): ModelSocketState {
  return {
    connectedAt: null,
    error: '',
    serverTime: null,
    status: modelSocketStatus.idle,
    validatedAt: null,
  }
}

export function createCollectionValue<
  Item,
  Key extends CollectionKey = ItemKey<Item>,
>(): CollectionBaseValue<Item, Key> {
  return {
    changed: new Set(),
    created: new Set(),
    records: new Map(),
  }
}

export function createDataManagerValue(): DataManagerValue {
  return {
    collections: new Map(),
  }
}
