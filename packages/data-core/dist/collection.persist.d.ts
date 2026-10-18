import { BehaviorSubject } from 'rxjs';
import type { CollectionBase, CollectionKey, CollectionPersistArgs, CollectionPersistRetry, CollectionPersistRequest } from './types.js';
type Args<Item, Key extends CollectionKey> = CollectionPersistRequest<Item, Key>;
export declare class CollectionPersistence<Item, Key extends CollectionKey> {
    private readonly collection;
    private readonly parseKey;
    readonly work$: BehaviorSubject<Args<Item, Key>[]>;
    readonly retry$: BehaviorSubject<Args<Item, Key>[]>;
    private readonly tasks;
    private readonly timers;
    private readonly delayMs;
    private readonly maxRetries;
    private readonly queueSubscription;
    private scheduled;
    private running;
    private stopped;
    private sequence;
    constructor(collection: CollectionBase<Item, Key>, parseKey: (key: Key) => Key, retry?: CollectionPersistRetry);
    persist(input: CollectionPersistArgs<Item, Key>): Promise<boolean>;
    pending(): Key[];
    abortPending(ids?: readonly Key[]): void;
    stop(): void;
    private schedule;
    private nextBatch;
    private drain;
    private _innerPersist;
    private retry;
    private finish;
}
export {};
//# sourceMappingURL=collection.persist.d.ts.map