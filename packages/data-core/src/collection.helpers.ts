import { prepareCollectionEntry } from './collection.validation.js'
import type {
  CollectionKey,
  CollectionValidation,
} from './types.js'

export function collectionItemEntries<Item, Key extends CollectionKey>(
  items: Iterable<Item> | Map<Key, Item>,
  validation: CollectionValidation<Item, Key>,
): (readonly [Key, Item])[] {
  if (items instanceof Map) {
    return Array.from(items, ([key, item]) =>
      prepareCollectionEntry(key, item, validation),
    )
  }

  return Array.from(items, (item) => {
    const parsed = validation.parseItem(item)
    const key = validation.keyOf(parsed)
    return [key, parsed] as const
  })
}

export function storeCollectionEntry<Item, Key extends CollectionKey>(
  value: {
    records: Map<Key, Item>
    changed: Set<Key>
    created: Set<Key>
  },
  entry: readonly [Key, Item],
  trackChange: boolean,
) {
  const [id, item] = entry
  const exists = value.records.has(id)
  value.records.set(id, item)

  if (trackChange) {
    value.changed.add(id)

    if (!exists) {
      value.created.add(id)
    }
  }
}
