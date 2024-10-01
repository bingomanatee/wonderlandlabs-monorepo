import type { TreeParams, UpdaterValueProviderFN } from '../types.js';
import type { CollectionIF, CollectionActFn  } from '../types/type.collection.js';

export * from './FormCollection/types.formCollection.js';

export type CollectionParams<
  ValueType,
  CollectionType = CollectionIF<ValueType>,
> = TreeParams<ValueType> & {
  actions?:
    | Map<string, CollectionActFn<ValueType, CollectionType>>
    | Record<string, CollectionActFn<ValueType, CollectionType>>;  
    revisions?:
    | Map<string, UpdaterValueProviderFN<ValueType>>
    | Record<string, UpdaterValueProviderFN<ValueType>>;
    
  reuseTree?: boolean;
};