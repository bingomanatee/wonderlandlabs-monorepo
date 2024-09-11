import type { CollectionIF } from '../types/type.collection';
import type { SubscribeFn } from '../types/types.shared';
import type { ForestIF } from '../types/types.forest';
import type { TreeIF, TreeParams } from '../types/types.trees';
import type { ChangeFN } from '../types/types.branch';
import type { PartialObserver } from 'rxjs';
export type CollectionParams<ValueType> = TreeParams<ValueType> & {
    actions?: Map<string, ChangeFN<ValueType>>;
    reuseTree?: boolean;
};
export declare class Collection<ValueType> implements CollectionIF<ValueType> {
    name: string;
    private params?;
    constructor(name: string, params?: CollectionParams<ValueType>, forest?: ForestIF);
    get value(): ValueType;
    act(name: string, seed?: unknown): void;
    next(next: ValueType, name: string): CollectionIF<ValueType>;
    mutate<SeedType>(mutator: ChangeFN<ValueType>, name: string, seed?: SeedType): this;
    protected get subject(): import("rxjs").Observable<ValueType>;
    subscribe(observer: PartialObserver<ValueType> | SubscribeFn<ValueType>): import("rxjs").Subscription;
    forest: ForestIF;
    get tree(): TreeIF<ValueType>;
}
