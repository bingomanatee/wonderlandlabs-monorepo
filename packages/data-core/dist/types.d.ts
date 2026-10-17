import type { z } from 'zod';
import type { BehaviorSubject, Observable } from 'rxjs';
import type { CollectionBase } from './CollectionBase.js';
import type { modelSocketStatus } from './constants.js';
export type { BehaviorSubject, Observable, CollectionBase, z };
export type CollectionKey = string | number;
export type ItemKey<Item> = Item extends {
    id: infer Key extends CollectionKey;
} ? Key : string;
export type IdentityProperty<Item, Key extends CollectionKey> = {
    [Property in keyof Item]-?: Item[Property] extends Key ? Property : never;
}[keyof Item];
export type ModelSchema<Item> = z.ZodType<Item> & {
    shape: Record<string, z.ZodType>;
};
export interface CollectionValidation<Item, Key extends CollectionKey> {
    keyOf: (item: Item) => Key;
    parseItem: (item: Item) => Item;
    parseKey: (key: Key) => Key;
    checkIdentity: boolean;
}
export interface CollectionBaseValue<Item, Key extends CollectionKey = ItemKey<Item>> {
    changed: Set<Key>;
    created: Set<Key>;
    records: Map<Key, Item>;
}
export type RecordUtility<Item, Key extends CollectionKey, Config, ReturnType> = (id: Key, config: Config | undefined, collection: CollectionBase<Item, Key>) => ReturnType;
export type RecordUtilities<Item, Key extends CollectionKey> = Record<string, RecordUtility<Item, Key, never, unknown>>;
export type BoundRecordUtilities<Item, Key extends CollectionKey, Utilities extends RecordUtilities<Item, Key>> = {
    readonly [Name in keyof Utilities]: (id: Key, config?: Parameters<Utilities[Name]>[1]) => ReturnType<Utilities[Name]>;
};
export type CollectionUtility<Item, Key extends CollectionKey, Config, Result> = (config: Config | undefined, collection: CollectionBase<Item, Key>) => Result;
export type CollectionUtilities<Item, Key extends CollectionKey> = Record<string, CollectionUtility<Item, Key, never, unknown>>;
export type BoundCollectionUtilities<Item, Key extends CollectionKey, Utilities extends CollectionUtilities<Item, Key>> = {
    readonly [Name in keyof Utilities]: (config?: Parameters<Utilities[Name]>[0]) => ReturnType<Utilities[Name]>;
};
export interface CollectionMethodsConfig<Item, Key extends CollectionKey, Records extends RecordUtilities<Item, Key> = {}, Collections extends CollectionUtilities<Item, Key> = {}> {
    recordMethods?: Records & RecordUtilities<Item, Key>;
    collectionMethods?: Collections & CollectionUtilities<Item, Key>;
}
export interface CollectionBaseConfig<Item, Key extends CollectionKey = ItemKey<Item>, Utilities extends RecordUtilities<Item, Key> = {}, Collections extends CollectionUtilities<Item, Key> = {}> {
    collectionMethods?: Collections;
    recordMethods?: Utilities;
    keyOf?: (item: Item) => Key;
    schema?: ModelSchema<Item>;
    identity?: IdentityProperty<Item, CollectionKey>;
}
export interface ModelAdapter<Item, Key extends CollectionKey = ItemKey<Item>> {
    delete(id: Key): void;
    getItem(id: Key): Item | undefined;
    put(id: Key, item: Item, trackChange?: boolean): void;
    putMany(items: Iterable<Item> | Map<Key, Item>, trackChange?: boolean): void;
}
export type ModelSocketStatus = (typeof modelSocketStatus)[keyof typeof modelSocketStatus];
export interface ModelSocketState {
    connectedAt: string | null;
    error: string;
    serverTime: string | null;
    status: ModelSocketStatus;
    validatedAt: string | null;
}
export interface GlobalModelSocketAdapter<Change = unknown> {
    changes$: Observable<Change>;
    state$: BehaviorSubject<ModelSocketState>;
    connect(): void;
    disconnect(): void;
}
export interface ModelCrudAdapter {
    delete?<Data = unknown>(input?: unknown): Promise<Data>;
    get?<Data = unknown>(input?: unknown): Promise<Data>;
    put?<Data = unknown>(input?: unknown): Promise<Data>;
}
export interface DataConnection<Change = unknown> {
    changes$?: Observable<Change>;
    delete<Data = unknown>(modelName: string, input?: unknown): Promise<Data>;
    ensureReady(): Promise<void>;
    get<Data = unknown>(modelName: string, input?: unknown): Promise<Data>;
    put<Data = unknown>(modelName: string, input?: unknown): Promise<Data>;
    start(): void;
    state$?: BehaviorSubject<ModelSocketState>;
    stop(): void;
}
export interface DataManagerValue {
    collections: Map<string, CollectionBaseValue<unknown, CollectionKey>>;
}
export interface DataManagerConfig<ValueType extends DataManagerValue = DataManagerValue, Change = unknown> {
    connections?: DataConnection<Change>[];
    connector?: DataConnector<Change>;
    name?: string;
    value?: ValueType;
}
export interface DataConnector<Change = unknown> {
    changes$?: Observable<Change>;
    delete<Data = unknown>(modelName: string, input?: unknown): Promise<Data>;
    get<Data = unknown>(modelName: string, input?: unknown): Promise<Data>;
    put<Data = unknown>(modelName: string, input?: unknown): Promise<Data>;
    start(): void;
    state$?: BehaviorSubject<ModelSocketState>;
    stop(): void;
}
export interface DataCollectionClass<KeyType extends CollectionKey, RecordType, BranchType extends CollectionBase<RecordType, KeyType> = CollectionBase<RecordType, KeyType>> {
    new (params: unknown): BranchType;
}
export type JsonFixtureRecords = object;
export type ModelIdentity<Schema extends z.ZodObject, Identity extends keyof z.output<Schema>> = Extract<z.output<Schema>[Identity], CollectionKey>;
export type SchemaCollectionConfig<Schema extends z.ZodObject, Identity extends IdentityProperty<z.output<Schema>, CollectionKey>, Utilities extends RecordUtilities<z.output<Schema>, ModelIdentity<Schema, Identity>> = {}, Collections extends CollectionUtilities<z.output<Schema>, ModelIdentity<Schema, Identity>> = {}> = CollectionBaseConfig<z.output<Schema>, ModelIdentity<Schema, Identity>, Utilities, Collections>;
export type SchemaCollectionClass<Schema extends z.ZodObject, Identity extends IdentityProperty<z.output<Schema>, CollectionKey>, Utilities extends RecordUtilities<z.output<Schema>, ModelIdentity<Schema, Identity>> = {}, Collections extends CollectionUtilities<z.output<Schema>, ModelIdentity<Schema, Identity>> = {}> = new (params: unknown) => CollectionBase<z.output<Schema>, ModelIdentity<Schema, Identity>, Utilities, Collections>;
export type CollectionConstructor = new (params: unknown) => object;
export type ValidCollectionClass<Branch extends CollectionConstructor> = InstanceType<Branch> extends CollectionBase<infer Item, infer Key> ? Branch : never;
export type InitialCollectionData<Branch extends CollectionConstructor> = InstanceType<Branch> extends CollectionBase<infer Item, infer Key> ? Map<Key, Item> : never;
export type ModelShape = Record<string, z.ZodType>;
//# sourceMappingURL=types.d.ts.map