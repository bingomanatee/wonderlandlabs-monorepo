import type {
  MutationValueProviderFN,
  SubscribeFn,
  TreeParams,
  UpdaterValueProviderFN,
} from '../types';
import { PartialObserver, Subscription, Unsubscribable } from 'rxjs';

export interface CollectionIF<ValueType> {
  // abstract
  value: ValueType;
  act<ParamType = unknown>(name: string, seed?: ParamType): any;
  next(value: ValueType, name?: string): void;
  mutate<ParamType = unknown>(
    mutatorFn: MutationValueProviderFN<ValueType, ParamType>,
    seed?: ParamType,
    name?: string,
  ): void;
  revise<ParamType = unknown>(name: string, seed?: ParamType): void;
  update<ParamType = unknown>(
    updaterFn: UpdaterValueProviderFN<ValueType, ParamType>,
    seed?: ParamType,
  ): void;
  subscribe(
    observer: PartialObserver<ValueType> | SubscribeFn<ValueType>,
  ): Subscription | Unsubscribable;
}

export type CollectionActFn<
  ValueType,
  ParamType = any,
  ReturnType = any,
> = (collection:  CollectionIF<ValueType>, seed?: ParamType) => ReturnType;

export type CollectionParams<
  ValueType,
> = TreeParams<ValueType> & {
  initial: ValueType;
  actions:
     Record<string, CollectionActFn<ValueType>>;
  revisions?:
     Record<string, UpdaterValueProviderFN<ValueType>>;
  reuseTree?: boolean;
};