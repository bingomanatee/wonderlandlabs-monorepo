import type { CollectionBaseConfig, CollectionKey, CollectionValidation } from './types.js';
export declare function parseCollectionKey(key: unknown): CollectionKey;
export declare function createCollectionValidation<Item, Key extends CollectionKey>(config: CollectionBaseConfig<Item, Key>): CollectionValidation<Item, Key>;
export declare function prepareCollectionEntry<Item, Key extends CollectionKey>(key: Key, item: Item, validation: CollectionValidation<Item, Key>): readonly [Key, Item];
//# sourceMappingURL=collection.validation.d.ts.map