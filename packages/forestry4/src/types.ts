import { z } from 'zod';

import { Subject, Subscription, Observer, Observable } from 'rxjs';
import { ZodParser } from './typeguards';

// these are the actions as defined, in the params
export type ActionParamsFn<
  DataType = unknown,
  Args extends readonly unknown[] = any[],
  Returned = any | void,
> = (value: DataType, ...args: Args) => Returned;

// these are the actions as exposed in the state
export type ActionExposedFn<
  Args extends readonly unknown[] = any[],
  Returned = any | void,
> = (...args: Args) => Returned;

export type ActionParamsRecord = Record<string, ActionParamsFn>;
export type ActionExposedRecord = Record<string, ActionExposedFn>;
// Utility type to transform ActionParamsFn to ActionExposedFn (removes first parameter)
export type TransformActionMethod<T> = T extends (
  value: any,
  ...args: infer Args
) => infer Return
  ? (...args: Args) => Return
  : T;

// Utility type to transform an entire ActionParamsRecord to ActionExposedRecord
export type TransformActionRecord<T extends ActionParamsRecord> = {
  [K in keyof T]: TransformActionMethod<T[K]>;
};

// Utility type to infer the exposed Actions type from ActionParamsRecord
export type InferExposedActions<T extends ActionParamsRecord> =
  TransformActionRecord<T>;

// Utility type to convert exposed ActionExposedRecord back to ActionParamsRecord (adds value parameter)
export type RecordToParams<
  T extends ActionExposedRecord,
  DataType = unknown,
> = {
  [K in keyof T]: T[K] extends (...args: infer Args) => infer Return
    ? (value: DataType, ...args: Args) => Return
    : never;
};
export type ValueTestFn<DataType> = (
  value: unknown,
  store: StoreIF<DataType>,
) => null | void | string;

export type Listener<DataType> =
  | Partial<Observer<DataType>>
  | ((value: DataType) => void);

// Validation result type
export type ValidationResult = string | null; // null = valid, string = error message

// Forest messaging system for validation
export interface ForestMessage {
  type:
    | 'set-pending'
    | 'validate-all'
    | 'validation-failure'
    | 'validation-complete'
    | 'complete';
  payload?: any;
  branchPath?: Path;
  error?: string;
  timestamp: number;
}

export type Validity = {
  isValid: boolean;
  error?: Error;
};

export type TransFn<DataType = unknown> = (value: DataType) => void;
export type PendingValue<DataType = unknown> = {
  id: string;
  value: DataType;
  isTransaction: boolean;
};

export interface StoreIF<
  DataType,
  Actions extends ActionExposedRecord = ActionExposedRecord,
> {
  value: DataType;
  name: string;

  subscribe(listener: Listener<DataType>): Subscription;
  transact(fn: TransFn<DataType>, suspendValidation: boolean): void;
  acts: Actions;
  $: Actions;
  next: (value: Partial<DataType>) => void;

  // Pending value management
  setPending: (value: DataType) => void;
  hasPending: () => boolean;
  clearPending: () => void;

  // Resource map for non-immutable external resources (DOM, WebGL, etc.)
  res: Map<string, any>;

  complete: () => DataType;
  isActive: boolean;

  // validators
  schema?: ZodParser;
  tests?: ValueTestFn<DataType> | ValueTestFn<DataType>[];
  prep?: (input: Partial<DataType>, current: DataType) => DataType;

  validate(value: unknown): Validity;

  isValid(value: unknown): boolean;

  // Core utility methods
  get(path?: Path): any;
  mutate(producerFn: (draft: DataType) => void, path?: Path): DataType;
}

export interface StoreBranch<
  DataType,
  Actions extends ActionExposedRecord = ActionExposedRecord,
> extends StoreIF<DataType, Actions> {
  path: Path;
  root: StoreBranch<unknown>;
  isRoot: boolean;
  parent?: StoreBranch<unknown>;
  broadcast: (message: unknown, fromRoot?: boolean) => void;
  receiver: Subject<unknown>;
  set(path, value): boolean;
  subject: Observable<DataType>;
  branch<Type, BranchActions extends ActionExposedRecord = ActionExposedRecord>(
    path: Path,
    params: BranchParams<Type, BranchActions>,
  ): StoreBranch<Type, BranchActions>;
}

// Resource map for managing non-immutable external resources
export type ResourceMap = Map<string, any>;

export type StoreParams<
  DataType,
  Actions extends ActionExposedRecord = ActionExposedRecord,
> = {
  value: DataType;
  actions?: RecordToParams<Actions, DataType>; // Input actions always have value as first parameter
  schema?: z.ZodSchema<DataType>;
  tests?: ValueTestFn<DataType> | ValueTestFn<DataType>[];
  prep?: (
    input: Partial<DataType>,
    current: DataType,
    initial: DataType,
  ) => DataType;
  resources?: ResourceMap;
  name?: string;
  debug?: boolean;
  res?: Map<string, any>;
};

// Specific type for branch parameters that properly types the actions
export type BranchParams<
  DataType,
  Actions extends ActionExposedRecord = ActionExposedRecord,
> = {
  actions?: RecordToParams<Actions, DataType>;
  schema?: z.ZodSchema<DataType>;
  tests?: ValueTestFn<DataType> | ValueTestFn<DataType>[];
  prep?: (
    input: Partial<DataType>,
    current: DataType,
    initial: DataType,
  ) => DataType;
  name?: string;
  debug?: boolean;
};

type PathElement = string;

export type Path = PathElement[] | string;
