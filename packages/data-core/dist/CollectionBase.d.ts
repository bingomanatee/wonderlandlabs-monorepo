import { Forest } from '@wonderlandlabs/forestry4';
import type { CollectionBaseConfig, CollectionBaseValue, CollectionKey, ItemKey, RecordUtilities, BoundRecordUtilities, BoundCollectionUtilities, CollectionUtilities } from './types.js';
export declare class CollectionBase<Item, Key extends CollectionKey = ItemKey<Item>, Utilities extends RecordUtilities<Item, Key> = {}, Collections extends CollectionUtilities<Item, Key> = {}> extends Forest<CollectionBaseValue<Item, Key>> {
    readonly collectionMethods: BoundCollectionUtilities<Item, Key, Collections>;
    readonly recordMethods: BoundRecordUtilities<Item, Key, Utilities>;
    readonly keyOf: (item: Item) => Key;
    private readonly validation;
    constructor(params: unknown, config?: CollectionBaseConfig<Item, Key, Utilities, Collections>);
    getItem(id: Key): Item | undefined;
    has(id: Key): boolean;
    list(): Item[];
    setItem(item: Item, trackChange?: boolean): void;
    put(id: Key, item: Item, trackChange?: boolean): void;
    setMany(items: Item[], trackChange?: boolean): void;
    putMany(items: Iterable<Item> | Map<Key, Item>, trackChange?: boolean): void;
    delete(id: Key): void;
    update(id: Key, patch: Partial<Item>, trackChange?: boolean): void;
    clearTracking(): void;
}
//# sourceMappingURL=CollectionBase.d.ts.map