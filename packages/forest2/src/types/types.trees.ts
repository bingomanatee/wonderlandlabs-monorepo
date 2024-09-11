import type { BranchIF } from "./types.branch";
import type { OffshootIF } from "../types";
import type { ForestIF } from "./types.forest";
import type { ChangeIF, Notable, SubscribeFn } from "./types.shared";
import { PartialObserver, Subscription, Observable } from "rxjs";

export type TreeName = string;

export type TreeValuation<ValueType> = {
  value: ValueType;
  tree: TreeIF<ValueType>;
  isValid: boolean;
  error?: string;
};

export interface TreeIF<ValueType> extends Notable {
  name?: TreeName;
  root?: BranchIF<ValueType>;
  top?: BranchIF<ValueType>;
  forest: ForestIF;
  readonly isUncacheable?: boolean;
  offshoots?: OffshootIF<ValueType>[];
  rollback(time: number, message: string): void;
  /**
   * note - the only advantage "grow" has over next is to assert a change function and parmeters for that function.
   */
  grow(change: ChangeIF<ValueType>): BranchIF<ValueType>;
  next(value: ValueType, name?: string): void; // next will use the name "next" if not documented
  value: ValueType;
  subject: Observable<ValueType>;
  subscribe(
    observer: PartialObserver<ValueType> | SubscribeFn<ValueType>
  ): Subscription;

  valueAt(at: number): ValueType | undefined;

  validate(value: ValueType): TreeValuation<ValueType>;
  depth(upTo: number): number;
}

export type ValidatorFn<TreeValueType> = (
  value: TreeValueType,
  tree: TreeIF<TreeValueType>
) => Error | void | undefined; // also throws

export type TreeClonerFn<TreeValueType> = (
  tree: TreeIF<TreeValueType>,
  branch?: BranchIF<TreeValueType>
) => TreeValueType;

export type TreeParamsBase<TreeValueType> = {
  initial?: TreeValueType;
  uncacheable?: boolean;
  maxBranches?: number; // if your history gets REALLY LONG (over say 200)...
  trimTo?: number; // ... trim the tree history to this many branches;
  validator?: ValidatorFn<TreeValueType>;
  cloner?: TreeClonerFn<TreeValueType>;
};

export type TreeParams<TreeValueType> =
  | TreeParamsBase<TreeValueType>
  | (TreeParamsBase<TreeValueType> & CachingParams<TreeValueType>);

export type CachingParams<TreeValueType> = {
  cloner: TreeClonerFn<TreeValueType>;
  cloneInterval: number;
};
