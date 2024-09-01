import type { CollectionIF } from "../type.collection";
import type { SubscribeFn } from "../types.shared";
import type { ForestIF } from "../types.forest";
import type { TreeIF, ValidatorFn } from "../types.trees";
import type { ChangeFN } from "../types.branch";
import type { PartialObserver } from "rxjs";
export type CollectionParams<ValueType> = {
    initial?: ValueType;
    validator?: ValidatorFn<ValueType>;
    actions?: Map<string, ChangeFN<ValueType>>;
};
export declare abstract class Collection<ValueType> implements CollectionIF<ValueType> {
    name: string;
    private params?;
    constructor(name: string, params?: CollectionParams<ValueType>, forest?: ForestIF);
    get value(): ValueType;
    next(next: ValueType): CollectionIF<ValueType>;
    mutate<SeedType>(next: ChangeFN<ValueType>, seed?: SeedType): this;
    protected get subject(): import("rxjs").Observable<ValueType>;
    subscribe(observer: PartialObserver<ValueType> | SubscribeFn<ValueType>): import("rxjs").Subscription;
    forest: ForestIF;
    protected get tree(): TreeIF<ValueType>;
}
