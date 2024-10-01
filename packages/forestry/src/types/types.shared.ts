import type { BranchIF } from './types.branch';
import type { TreeIF } from './types.trees';
import type { ValueProviderContext } from './ValueProviderContext';

export interface OffshootIF<ValueType> {
  time: number;
  error: string;
  branch: BranchIF<ValueType>;
}

/**
 * a "literal replacement value"
 */
export interface Assertion<ValueType> {
  assert: ValueType;
  name: string;
  time?: number; // in truncation time is asserted; do not manually assert time yourself.
}

/**
 * a "dynamic mutator" that computes off the previous branch
 */
export interface Mutator<ValueType> {
  mutator: MutationValueProviderFN<ValueType>;
  seed?: any;
  name: string;
}

/**
 * a change is an "assertion of a new value."
 * All changes must be named, to define clear journaling of acuase.
 */
export type ChangeIF<ValueType> = Mutator<ValueType> | Assertion<ValueType>;
export type SubscribeFn<ValueType> = (next: ValueType) => any;

export type IterFn<KeyType, ValueType> = (v: ValueType, k: KeyType) => void;

export type InfoParams = Record<string, any>;
export type Info = {
  message: string;
  params?: InfoParams;
  time: number;
  tree?: string;
};
export interface Notable {
  addNote(message: string, params?: InfoParams): void;
  hasNoteAt(time: number): boolean;
  notes(fromTime: number, toTime?: number): Info[];
}

export type NotesMap = Map<number, Info[]>;

export type VPRContextKeys = keyof typeof ValueProviderContext;

export type ValueProviderContextType = (typeof ValueProviderContext)[VPRContextKeys];
/**
 * export const TypeEnum : {
  string : 'string',
  number :  'number',
  boolean : 'boolean',
  symbol : 'symbol',
  array : 'array',
  map : 'map',
  object : 'object',
  set : 'set',
  null : 'null',
  undefined : 'undefined',
  function : 'function'
}

 export type TypeEnumKeys = keyof typeof TypeEnum;

//  v v v ---- this is a "pure" type = it can be used in your typescript code
//             and doesn't exist in any boundary state, like enums
export type TypeEnumType = typeof TypeEnum[TypeEnumKeys]
 */

export type BaseValueProviderParams<Value> = {
  branch: BranchIF<Value>;
  tree: TreeIF<Value>;
  value: Value;
  context: ValueProviderContextType;
};

export type MutationValueProviderParams<
  Value,
  ParamType = unknown,
> = BaseValueProviderParams<Value> & {
  branch: BranchIF<Value> | undefined;
  value: Value | undefined;
  seed?: ParamType;
};

export type LocalValueProviderParams<Value> = BaseValueProviderParams<Value> & {};

export type TruncationValueProviderParams<Value> = BaseValueProviderParams<Value> & {};

export type IttermittentCacheProviderParams<Value> = BaseValueProviderParams<Value> & {};

export type ValueProviderParams<Value = unknown, ParamType = unknown> =
  | MutationValueProviderParams<Value, ParamType>
  | LocalValueProviderParams<Value>
  | TruncationValueProviderParams<Value>
  | IttermittentCacheProviderParams<Value>;

/**
 * ValueProviders are used:
 * . to cache a value for truncation - which will be the "new root" transforming into an assertion.
 * . to cache a value for ittermittent caching - which will inject an assertion node in the tree
 *    to limit callback depth
 * . local Caching - to eliminate the necessity for repetitive calls to a mutation provider.
 *
 * Mutators are defiend in the changer of the branch; the other providers are embedded in the tree definition.
 *  They will often produce a dynamic (proxy) of the previous value, to limit memory bloat.
 *
 * Truncation and Ittermittent caching should be a "hard serialization" - if the original value was a proxy, for instance, you want to produce
 * a less dynamic object, map or whatever. Especially with Truncation, as you want to limit the reference to the previous
 * branch which is destroyed in the process.
 *
 * Local caching will be done on nearly every branch, so you in general will just want to produce the value that comes
 * out of the branches mutatorProvider unchanged.
 *
 *
 *
 */
export type ValueProviderFN<Value = unknown, ParamType = any> = (
  params: ValueProviderParams<Value, ParamType>
) => Value;

export type MutationValueProviderFN<Value = unknown, ParamType = any> = (
  params: MutationValueProviderParams<Value, ParamType>
) => Value;

export type UpdaterValueProviderFN<Value = unknown, SeedType = any> = (
  value: Value,
  seed?: SeedType
) => Value;
