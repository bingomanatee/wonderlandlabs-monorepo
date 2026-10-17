import type {
  BoundRecordUtilities,
  CollectionBase,
  CollectionKey,
  RecordUtilities,
} from './types.js'

export function bindRecordUtilities<
  Item,
  Key extends CollectionKey,
  Utilities extends RecordUtilities<Item, Key>,
>(
  collection: CollectionBase<Item, Key>,
  utilities: Utilities,
  parseKey: (id: Key) => Key,
): BoundRecordUtilities<Item, Key, Utilities> {
  return Object.freeze(
    Object.fromEntries(
      Object.entries(utilities).map(([name, utility]) => [
        name,
        (id: Key, config?: never) => utility(parseKey(id), config, collection),
      ]),
    ),
  ) as BoundRecordUtilities<Item, Key, Utilities>
}
