import type { CollectionComparator, CollectionFindQuery, CollectionKey } from './types.js';
export declare function findCollectionEntries<Item, Key extends CollectionKey>(records: ReadonlyMap<Key, Item>, query: CollectionFindQuery<Item, Key>, parseKey: (key: Key) => Key): [Key, Item][];
export declare function findCollectionItems<Item, Key extends CollectionKey>(records: ReadonlyMap<Key, Item>, query: CollectionFindQuery<Item, Key>, parseKey: (key: Key) => Key, sortFn?: CollectionComparator<Item>): Item[];
//# sourceMappingURL=collection.find.d.ts.map