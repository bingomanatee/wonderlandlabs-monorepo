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
  params: CollectionParams<ValueType>;
  act<ParamType = unknown>(name: string, seed?: ParamType): any;
  do: DoRecord<any>;
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
  CollectionType = CollectionIF<ValueType>,
  ParamType = any,
  ReturnType = any,
> = (collection: CollectionType, seed?: ParamType) => ReturnType;



export type RevisionsRecord<ValueType> = Record<string, UpdaterValueProviderFN<ValueType>>;
export type ActionsRecord<ValueType, CollectionType> = Record<string, CollectionActFn<ValueType, CollectionType>>;

export type CollectionParams<
  ValueType,
> = TreeParams<ValueType> & {
  actions: ActionsRecord<ValueType, CollectionIF<ValueType>>;
  revisions?:
    Record<string, UpdaterValueProviderFN<ValueType>>;

  reuseTree?: boolean;
};


/**
   TActions[K] extends CollectionActFn<ValueType, SelfType, infer ParamType>
   ? (seed?: ParamType) => ReturnType<TActions[K]>
   : never;
   */
export type DoRecord<Acts> = {
    [K in keyof Acts]: OmitThisParameter<Acts[K]>;
  };
