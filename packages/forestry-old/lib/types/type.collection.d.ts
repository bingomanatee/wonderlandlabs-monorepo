import { PartialObserver, Subscription, Unsubscribable } from 'rxjs';
import type { MutationValueProviderFN, SubscribeFn } from './types.shared';
export interface CollectionIF<ValueType> {
    value: ValueType;
    next(value: ValueType, name: string): CollectionIF<ValueType>;
    mutate<ParamType = unknown>(coll: MutationValueProviderFN<ValueType>, name: string, seed?: ParamType): CollectionIF<ValueType>;
    subscribe(observer: PartialObserver<ValueType> | SubscribeFn<ValueType>): Subscription | Unsubscribable;
}
export type CollectionAction<ValueType> = (collection: CollectionIF<ValueType>, seed?: any) => any;
