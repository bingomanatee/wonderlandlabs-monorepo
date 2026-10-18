import type {
  CollectionComparator,
  CollectionFindQuery,
  CollectionKey,
} from './types.js'

function isKeyList<Key extends CollectionKey>(
  query: unknown,
): query is readonly Key[] {
  return Array.isArray(query)
}

export function findCollectionEntries<Item, Key extends CollectionKey>(
  records: ReadonlyMap<Key, Item>,
  query: CollectionFindQuery<Item, Key>,
  parseKey: (key: Key) => Key,
): [Key, Item][] {
  if (isKeyList<Key>(query)) {
    const keys = query.map(parseKey)
    return keys
      .filter((key) => records.has(key))
      .map((key) => [key, records.get(key) as Item])
  }

  const entries = Array.from(records.entries())
  if (typeof query === 'function') {
    return entries.filter(([, item]) => query(item))
  }

  const fields = Reflect.ownKeys(query as object)
  return entries.filter(([, item]) =>
    fields.every((field) =>
      Object.is(
        Reflect.get(Object(item), field),
        Reflect.get(query as object, field),
      ),
    ),
  )
}

export function findCollectionItems<Item, Key extends CollectionKey>(
  records: ReadonlyMap<Key, Item>,
  query: CollectionFindQuery<Item, Key>,
  parseKey: (key: Key) => Key,
  sortFn?: CollectionComparator<Item>,
): Item[] {
  const result = findCollectionEntries(records, query, parseKey)
    .map(([, item]) => item)
  return sortFn ? result.sort(sortFn) : result
}
