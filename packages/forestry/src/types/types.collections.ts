import type {
  MutationValueProviderFN,
  SubscribeFn,
  UpdaterValueProviderFN,
} from '../types';
import type {ForestIF} from './types.forest';
import type {TreeParams} from '../types/types.trees';

import { PartialObserver, Subscription, Unsubscribable } from 'rxjs';

export interface CollectionIF<ValueType> {
  // abstract
  value: ValueType;
  params: CollectionParams<ValueType>;
  forest: ForestIF,
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

// Action function type for stricter typing
export interface CollectionActFn<ValueType, SeedType, ResultType> {
  (collection: CollectionIF<ValueType>, seed: SeedType): ResultType;
}

// Define actions with strict types
export type CollectionActions<ValueType> = Record<string, CollectionActFn<ValueType, any, any>>;
export type CollectionRevisions<ValueType> = Record<string, UpdaterValueProviderFN<ValueType>>;

export type CollectionParams<ValueType> = {
  revisions?: CollectionRevisions<ValueType>;
  actions: CollectionActions<ValueType>; // Use the strongly typed actions
  initial: ValueType;
  reuseTree?: boolean;
} & TreeParams<ValueType>;
