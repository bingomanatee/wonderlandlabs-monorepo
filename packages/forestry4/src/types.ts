import { z } from 'zod';

import { Observable, Observer, Subscription } from 'rxjs';
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
  value: DataType;
  $name: string;

  subscribe(listener: Listener<DataType>): Subscription;

  $transact(params: TransParams | TransFn<DataType>, suspend?: boolean): void;

  next: (value: Partial<DataType>) => void;

  // Resource map for non-immutable external resources (DOM, WebGL, etc.)
  $res: Map<string, any>;

  complete: () => DataType;
  isActive: boolean;

  // validators
  $schema?: ZodParser;
  $test(value: unknown): Validity;
  $validate(value: unknown): Validity;
  $isValid(value: unknown): boolean;

  // Core utility methods
  get(path?: Path): any;
  set(path: Path, value: unknown): void;
  mutate(producerFn: (draft: DataType) => void, path?: Path): DataType;

  $root: StoreIF<unknown>;
  $isRoot: boolean;
  $parent?: StoreIF<unknown>;
  $broadcast: (message: unknown, down?: boolean) => void;
}

export interface StoreBranch<DataType> extends StoreIF<DataType> {
  $path: Path;
  $root: StoreBranch<unknown>;
  $isRoot: boolean;
  $parent?: StoreBranch<unknown>;
  $broadcast: (message: unknown, fromRoot?: boolean) => void;
  set(path: Path, value: unknown): void;
  $subject: Observable<DataType>;
  $branch<Type, Subclass extends StoreBranch<Type> = StoreBranch<Type>>(
    path: Path,
    params: BranchParams<Type, Subclass>,
  ): Subclass;
}

// Resource map for managing non-immutable external resources
export type ResourceMap = Map<string, any>;
export type ValueTestFn<DataType> = (
  value: unknown,
  store: StoreIF<DataType>,
) => null | void | string;

export type StoreParams<DataType> = {
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
};

// Specific type for $branch parameters that properly types the subclass
export type BranchParams<DataType, Subclass extends StoreBranch<DataType> = StoreBranch<DataType>> = {
  schema?: z.ZodSchema<DataType>;
  tests?: ValueTestFn<DataType> | ValueTestFn<DataType>[];
  prep?: (
    input: Partial<DataType>,
    current: DataType,
    initial: DataType,
  ) => DataType;
  name?: string;
  debug?: boolean;
  res?: Map<string, any>;
  subclass?: Subclass;
};

type PathElement = string;

export type Path = PathElement[] | string;
