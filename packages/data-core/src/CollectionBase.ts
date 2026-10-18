import type { BehaviorSubject } from 'rxjs'
import { Forest } from '@wonderlandlabs/forestry4'
import type {
  CollectionBaseConfig,
  CollectionPersistArgs,
  CollectionPersistRequest,
  CollectionFindQuery,
  CollectionComparator,
  RecordComparator,
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
import {
  findCollectionEntries,
  findCollectionItems,
} from './collection.find.js'
import { CollectionPersistence } from './collection.persist.js'
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
  private readonly recordComparator: RecordComparator<Item>
  private readonly persistence: CollectionPersistence<Item, Key>
  private readonly validation: CollectionValidation<Item, Key>

  constructor(
    params: unknown,
    config: CollectionBaseConfig<Item, Key, Utilities, Collections> = {},
  ) {
    super(params as never)
    this.recordComparator = config.recordComparator ?? Object.is
    this.validation = createCollectionValidation(config)
    this.keyOf = this.validation.keyOf
    this.persistence = new CollectionPersistence(
      this,
      this.validation.parseKey,
      config.persistRetry,
    )
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

  get persistWork$(): BehaviorSubject<CollectionPersistRequest<Item, Key>[]> {
    return this.persistence.work$
  }

  get persistRetry$(): BehaviorSubject<CollectionPersistRequest<Item, Key>[]> {
    return this.persistence.retry$
  }

  persist(args: CollectionPersistArgs<Item, Key>): Promise<boolean> {
    return this.persistence.persist(args)
  }

  syncRecords(records: Map<Key, Item>, clearLocalEdits = false): void {
    const entries = collectionItemEntries(records, this.validation)
    const changes = entries.flatMap(([id, item]) => {
      const { records: current, changed, created } = this.value
      const tracked = changed.has(id) || created.has(id)
      if (!clearLocalEdits && tracked) return []
      const equivalent = current.has(id) && this.recordComparator(
        current.get(id) as Item, item,
      )
      return equivalent && !tracked ? [] : [{ id, item, equivalent }]
    })
    if (!changes.length) return
    this.mutate((draft) => {
      for (const { id, item, equivalent } of changes) {
        if (!equivalent) draft.records.set(id, item)
        if (clearLocalEdits) {
          draft.changed.delete(id)
          draft.created.delete(id)
        }
      }
    })
  }

  abortPending(ids?: readonly Key[]): void {
    this.persistence.abortPending(ids)
  }

  pendingPersists(): Key[] {
    return this.persistence.pending()
  }

  complete() {
    this.persistence?.stop()
    return super.complete()
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

  find(
    query: CollectionFindQuery<Item, Key>,
    sortFn?: CollectionComparator<Item>,
  ): Item[] {
    return findCollectionItems(
      this.value.records,
      query,
      this.validation.parseKey,
      sortFn,
    )
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

  delete(query: Key | CollectionFindQuery<Item, Key>): void {
    this.cleanCollection(
      typeof query === 'string' || typeof query === 'number'
        ? [query as Key]
        : query as CollectionFindQuery<Item, Key>,
    )
  }

  cleanCollection(query: CollectionFindQuery<Item, Key>): void {
    const entries = findCollectionEntries(
      this.value.records,
      query,
      this.validation.parseKey,
    )
    if (!entries.length) return

    this.mutate((draft) => {
      for (const [key] of entries) {
        draft.records.delete(key)
        draft.changed.delete(key)
        draft.created.delete(key)
      }
    })
  }

  cleanAll(): void {
    this.mutate((draft) => {
      draft.records.clear()
      draft.changed.clear()
      draft.created.clear()
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

}
