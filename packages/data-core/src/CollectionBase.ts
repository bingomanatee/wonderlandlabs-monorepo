import { Forest } from '@wonderlandlabs/forestry4'
import type {
  CollectionBaseConfig,
  CollectionBaseValue,
  CollectionKey,
  CollectionValidation,
  ItemKey,
  RecordUtilities,
  BoundRecordUtilities,
  BoundCollectionUtilities,
  CollectionUtilities,
} from './types.js'
import {
  collectionItemEntries,
  storeCollectionEntry,
} from './collection.helpers.js'
import {
  createCollectionValidation,
  prepareCollectionEntry,
} from './collection.validation.js'
import { bindCollectionUtilities } from './collection.utilities.js'
import { bindRecordUtilities } from './record.helpers.js'
import { dataCoreErrors } from './constants.js'

export class CollectionBase<
  Item,
  Key extends CollectionKey = ItemKey<Item>,
  Utilities extends RecordUtilities<Item, Key> = {},
  Collections extends CollectionUtilities<Item, Key> = {},
> extends Forest<CollectionBaseValue<Item, Key>> {
  readonly collectionMethods: BoundCollectionUtilities<Item, Key, Collections>
  readonly recordMethods: BoundRecordUtilities<Item, Key, Utilities>
  readonly keyOf: (item: Item) => Key
  private readonly validation: CollectionValidation<Item, Key>

  constructor(
    params: unknown,
    config: CollectionBaseConfig<Item, Key, Utilities, Collections> = {},
  ) {
    super(params as never)
    this.validation = createCollectionValidation(config)
    this.keyOf = this.validation.keyOf
    this.collectionMethods = bindCollectionUtilities(
      this,
      config.collectionMethods ?? ({} as Collections),
    )
    this.recordMethods = bindRecordUtilities(
      this,
      config.recordMethods ?? ({} as Utilities),
      this.validation.parseKey,
    )
  }

  getItem(id: Key) {
    return this.value.records.get(this.validation.parseKey(id))
  }

  has(id: Key) {
    return this.value.records.has(this.validation.parseKey(id))
  }

  list() {
    return Array.from(this.value.records.values())
  }

  setItem(item: Item, trackChange = true) {
    const [entry] = collectionItemEntries([item], this.validation)
    this.mutate((draft) => storeCollectionEntry(draft, entry, trackChange))
  }

  put(id: Key, item: Item, trackChange = true) {
    const entry = prepareCollectionEntry(id, item, this.validation)
    this.mutate((draft) => storeCollectionEntry(draft, entry, trackChange))
  }

  setMany(items: Item[], trackChange = false) {
    this.putMany(items, trackChange)
  }

  putMany(items: Iterable<Item> | Map<Key, Item>, trackChange = false) {
    const entries = collectionItemEntries(items, this.validation)
    this.mutate((draft) => {
      for (const entry of entries) {
        storeCollectionEntry(draft, entry, trackChange)
      }
    })
  }

  delete(id: Key) {
    const key = this.validation.parseKey(id)
    this.mutate((draft) => {
      draft.records.delete(key)
      draft.changed.delete(key)
      draft.created.delete(key)
    })
  }

  update(id: Key, patch: Partial<Item>, trackChange = true) {
    const current = this.getItem(id)

    if (!current) {
      return
    }

    const next = this.validation.parseItem({ ...current, ...patch })
    const key = this.validation.parseKey(id)

    if (this.validation.keyOf(next) !== key) {
      throw new Error(dataCoreErrors.changedIdentity)
    }

    this.mutate((draft) => {
      storeCollectionEntry(draft, [key, next], trackChange)
    })
  }

  clearTracking() {
    this.mutate((draft) => {
      draft.changed = new Set()
      draft.created = new Set()
    })
  }
}
