import type { BehaviorSubject, Observable } from 'rxjs';
import { Forest } from '@wonderlandlabs/forestry4';
import type { CollectionBaseConfig, CollectionPersistArgs, CollectionPersistRequest, CollectionFindQuery, CollectionComparator, CollectionBaseValue, CollectionKey, ItemKey, RecordUtilities, BoundRecordUtilities, BoundCollectionUtilities, CollectionUtilities } from './types.js';
export declare class CollectionBase<Item, Key extends CollectionKey = ItemKey<Item>, Utilities extends RecordUtilities<Item, Key> = {}, Collections extends CollectionUtilities<Item, Key> = {}> extends Forest<CollectionBaseValue<Item, Key>> {
    readonly collectionMethods: BoundCollectionUtilities<Item, Key, Collections>;
    readonly recordMethods: BoundRecordUtilities<Item, Key, Utilities>;
    readonly keyOf: (item: Item) => Key;
    private readonly recordComparator;
    private readonly persistence;
    private readonly validation;
    constructor(params: unknown, config?: CollectionBaseConfig<Item, Key, Utilities, Collections>);
    get persistWork$(): BehaviorSubject<CollectionPersistRequest<Item, Key>[]>;
    get persistRetry$(): BehaviorSubject<CollectionPersistRequest<Item, Key>[]>;
    get persistCommitted$(): Observable<readonly Key[]>;
    get persistExhausted$(): Observable<readonly Key[]>;
    persist(args: CollectionPersistArgs<Item, Key>): Promise<boolean>;
    syncRecords(records: Map<Key, Item>, clearLocalEdits?: boolean): void;
    abortPending(ids?: readonly Key[]): void;
    pendingPersists(): Key[];
    complete(): CollectionBaseValue<Item, Key>;
    getItem(id: Key): Item | undefined;
    has(id: Key): boolean;
    list(): Item[];
    find(query: CollectionFindQuery<Item, Key>, sortFn?: CollectionComparator<Item>): Item[];
    setItem(item: Item, trackChange?: boolean): void;
    put(id: Key, item: Item, trackChange?: boolean): void;
    setMany(items: Item[], trackChange?: boolean): void;
    putMany(items: Iterable<Item> | Map<Key, Item>, trackChange?: boolean): void;
    delete(query: Key | CollectionFindQuery<Item, Key>): void;
    cleanCollection(query: CollectionFindQuery<Item, Key>): void;
    cleanAll(): void;
    update(id: Key, patch: Partial<Item>, trackChange?: boolean): void;
}
//# sourceMappingURL=CollectionBase.d.ts.map