import { z } from 'zod';

import { Observable, Observer, SubjectLike, Subscription } from 'rxjs';
import { ZodParser } from './typeguards';

export type TransParams = {
  action: TransFn;
  suspendValidation?: boolean;
};

export type Listener<DataType> =
  | Partial<Observer<DataType>>
  | ((value: DataType) => void);

/**
 * Utility type for Forest subclasses - the recommended pattern for Forestry4
 *
 * @example Recommended Usage:
 * ```typescript
 * // ✅ Extend Forest to create custom stores
 * class UserStore extends Forest<UserData> {
 *   constructor() {
 *     super({ value: { name: '', email: '' } });
 *   }
 *
 *   updateProfile(data: Partial<UserData>) {
 *     this.mutate(draft => Object.assign(draft, data));
 *   }
 * }
 *
 * // ✅ Use the custom store
 * const userStore = new UserStore();
 * userStore.updateProfile({ name: 'John' });
 * ```
 */
export type ForestSubclass<T> = new (...args: any[]) => Forest<T>;

// Validation result type
export type ValidationResult = string | null; // null = valid, string = error message

// Forest messaging system for validation
export interface ForestMessage {
  type:
    | '$validate-all'
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
  suspendValidation?: boolean;
};

export interface StoreIF<DataType> {
  $broadcast: (message: unknown, down?: boolean) => void;
  $isRoot: boolean;

  $isValid(value: unknown): boolean;

  $name: string;

  $parent?: StoreIF<unknown> | undefined;
  $path?: Path | undefined;
  $res: Map<string, any>;

  // Resource map for non-immutable external resources (DOM, WebGL, etc.)
  $root: StoreIF<unknown>;

  $schema?: ZodParser;

  $test(value: unknown): Validity;

  // validators
  $transact(params: TransParams | TransFn<DataType>, suspend?: boolean): void;

  $validate(value: unknown): Validity;

  complete: () => DataType;

  get(path?: Path): any;

  // Core utility methods
  isActive: boolean;

  mutate(producerFn: (draft: DataType) => void, path?: Path): DataType;

  next: (value: Partial<DataType>) => void;

  receiver: SubjectLike<unknown>;

  set(path: Path, value: unknown): void;

  subscribe(listener: Listener<DataType>): Subscription;

  value: DataType;
}

// Resource map for managing non-immutable external resources
export type ResourceMap = Map<string, any>;
export type ValueTestFn<DataType> = (
  value: unknown,
  store: StoreIF<DataType>,
) => null | void | string;

export type StoreParams<DataType, SubClass = StoreIF<DataType>> = {
  value: DataType;
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
  path?: Path;
  parent?: StoreIF<unknown>;
  subclass?: SubClass;
};

type PathElement = string;

export type Path = PathElement[] | string;
