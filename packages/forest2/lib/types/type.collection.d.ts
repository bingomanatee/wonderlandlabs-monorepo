import { PartialObserver, Subscription, Unsubscribable } from "rxjs";
import type { SubscribeFn, ValueProviderFN } from "./types.shared";
export interface CollectionIF<ValueType> {
    value: ValueType;
    next(value: ValueType, name: string): CollectionIF<ValueType>;
    mutate<ParamType = unknown>(coll: ValueProviderFN<ValueType>, name: string, seed?: ParamType): CollectionIF<ValueType>;
    subscribe(observer: PartialObserver<ValueType> | SubscribeFn<ValueType>): Subscription | Unsubscribable;
}
