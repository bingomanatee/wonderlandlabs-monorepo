import { PartialObserver, Subscription, Unsubscribable } from "rxjs";
import type { MutatorFn } from "./types.branch";
import type { SubscribeFn } from "./types.shared";

export interface CollectionIF<ValueType> {
  // abstract
  value: ValueType;
  next(value: ValueType, name: string): CollectionIF<ValueType>;
  mutate<ParamType = unknown>(
    coll: MutatorFn<ValueType>,
    name: string,
    seed?: ParamType
  ): CollectionIF<ValueType>;
  subscribe(
    observer: PartialObserver<ValueType> | SubscribeFn<ValueType>
  ): Subscription | Unsubscribable;
}
