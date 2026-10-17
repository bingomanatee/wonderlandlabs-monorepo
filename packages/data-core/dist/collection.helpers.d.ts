import type { CollectionBaseValue, CollectionKey, CollectionValidation } from './types.js';
export declare function collectionItemEntries<Item, Key extends CollectionKey>(items: Iterable<Item> | Map<Key, Item>, validation: CollectionValidation<Item, Key>): (readonly [Key, Item])[];
export declare function storeCollectionEntry<Item, Key extends CollectionKey>(value: CollectionBaseValue<Item, Key>, entry: readonly [Key, Item], trackChange: boolean): void;
//# sourceMappingURL=collection.helpers.d.ts.map