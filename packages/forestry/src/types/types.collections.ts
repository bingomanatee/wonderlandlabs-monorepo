import {
  MutationValueProviderFN,
  ObserverOrSubscribeFn,
  UpdaterValueProviderFN,
} from './../types';
import type { ForestIF } from './types.forest';
import type { TreeParams } from './types.trees';

import { Subscription, Unsubscribable } from 'rxjs';

export interface CollectionIF<ValueType> {
  // abstract
  acts: Record<string, (...args: any[]) => any>;
  forest: ForestIF;

  mutate<ParamType = unknown>(
    mutatorFn: MutationValueProviderFN<ValueType, ParamType>,
    seed?: ParamType,
    name?: string,
  ): void;

  next(value: ValueType, name?: string): void;

  params: TreeParams<ValueType>;

  subscribe(
    observer: ObserverOrSubscribeFn<ValueType>,
  ): Subscription | Unsubscribable;

  update<ParamType = unknown>(
    updaterFn: UpdaterValueProviderFN<ValueType, ParamType>,
    seed?: ParamType,
  ): void;

  value: ValueType;
}

// Action function type for stricter typing
export interface CollectionActFn<ValueType, SeedType, ResultType> {
  (collection: CollectionIF<ValueType>, seed: SeedType): ResultType;
}

// Define actions with strict types
export type CollectionActions<ValueType> = Record<
  string,
  CollectionActFn<ValueType, any, any>
>;
export type CollectionRevisions<ValueType> = Record<
  string,
  UpdaterValueProviderFN<ValueType>
>;

export type CollectionParams<ValueType> = {
  revisions?: CollectionRevisions<ValueType>;
  actions: CollectionActions<ValueType>; // Use the strongly typed actions
  initial: ValueType;
  reuseTree?: boolean;
} & TreeParams<ValueType>;
