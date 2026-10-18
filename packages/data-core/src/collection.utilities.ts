import type {
  BoundCollectionUtilities,
  CollectionBase,
  CollectionKey,
  CollectionUtilities,
} from './types.js'

export function bindCollectionUtilities<
  Item,
  Key extends CollectionKey,
  Utilities extends CollectionUtilities<Item, Key>,
>(
  collection: CollectionBase<Item, Key>,
  utilities: Utilities,
): BoundCollectionUtilities<Item, Key, Utilities> {
  return Object.freeze(
    Object.fromEntries(
      Object.entries(utilities).map(([name, utility]) => [
        name,
        (config?: never) => utility(config, collection),
      ]),
    ),
  ) as BoundCollectionUtilities<Item, Key, Utilities>
}
