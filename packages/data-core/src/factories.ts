import { connectionStatus } from './constants.js'
import type {
  CollectionBaseValue,
  CollectionKey,
  ItemKey,
  DataManagerValue,
  ConnectionState,
} from './types.js'

export function createEmptyConnectionState(): ConnectionState {
  return {
    connectedAt: null,
    error: '',
    serverTime: null,
    status: connectionStatus.idle,
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
