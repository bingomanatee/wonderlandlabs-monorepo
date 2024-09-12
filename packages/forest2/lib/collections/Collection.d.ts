import type { CollectionIF } from "../types/type.collection";
import type { SubscribeFn, ValueProviderFN } from "../types/types.shared";
import type { ForestIF } from "../types/types.forest";
import type { TreeIF, TreeParams } from "../types/types.trees";
import type { PartialObserver } from "rxjs";
type CollectionAction<ValueType> = (collection: CollectionIF<ValueType>, seed?: any) => any;
export type CollectionParams<ValueType> = TreeParams<ValueType> & {
    actions?: Map<string, CollectionAction<ValueType>>;
    reuseTree?: boolean;
};
export declare class Collection<ValueType> implements CollectionIF<ValueType> {
    name: string;
    private params?;
    constructor(name: string, params?: CollectionParams<ValueType>, forest?: ForestIF);
    get value(): ValueType;
    act(name: string, seed?: unknown): any;
    next(next: ValueType, name: string): CollectionIF<ValueType>;
    mutate<SeedType>(mutator: ValueProviderFN<ValueType>, name: string, seed?: SeedType): this;
    protected get subject(): import("rxjs").Observable<ValueType>;
    subscribe(observer: PartialObserver<ValueType> | SubscribeFn<ValueType>): import("rxjs").Subscription;
    forest: ForestIF;
    get tree(): TreeIF<ValueType>;
}
export {};
