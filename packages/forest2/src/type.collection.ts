import { PartialObserver, Subscription } from "rxjs";
import type { SubscribeFn } from "./types.shared";
import type { ChangeFN } from "./types.branch";

export interface CollectionIF<ValueType> {
  // abstract
  value: ValueType;
  next(value: ValueType): CollectionIF<ValueType>;
  mutate<ParamType = unknown, RestType = unknown>(
    coll: ChangeFN<ValueType>,
    seed?: ParamType
  ): CollectionIF<ValueType>;
  subscribe(
    observer: PartialObserver<ValueType> | SubscribeFn<ValueType>
  ): Subscription;
}
