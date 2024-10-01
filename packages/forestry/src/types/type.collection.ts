import { PartialObserver, Subscription, Unsubscribable } from 'rxjs';
import type { MutationValueProviderFN, SubscribeFn, UpdaterValueProviderFN } from './types.shared';

export interface CollectionIF<ValueType> {
  // abstract
  value: ValueType;
  act<ParamType = unknown>(name: string, seed?: ParamType): any;
  next(value: ValueType, name?: string): void;
  mutate<ParamType = unknown>(
    mutatorFn: MutationValueProviderFN<ValueType, ParamType>,
    seed?: ParamType,
    name?: string
  ): void;
  revise<ParamType = unknown>(name: string, seed?: ParamType): void;
  update<ParamType = unknown>(
    updaterFn: UpdaterValueProviderFN<ValueType, ParamType>,
    seed?: ParamType
  ): void;
  subscribe(
    observer: PartialObserver<ValueType> | SubscribeFn<ValueType>
  ): Subscription | Unsubscribable;
}

export type CollectionActFn<
  ValueType,
  CollectionType = CollectionIF<ValueType>,
  ParamType = any,
  ReturnType = any,
> = (collection: CollectionType, seed?: ParamType) => ReturnType;
