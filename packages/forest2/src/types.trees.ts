import type { BranchIF } from "./types.branch";
import type { OffshootIF } from "./types";
import type { ForestIF } from "./types.forest";
import type { ChangeIF } from "./types.shared";

export type TreeName = string;

export interface TreeIF<ValueType> {
  name?: TreeName;
  root?: BranchIF<ValueType>;
  top?: BranchIF<ValueType>;
  forest: ForestIF;
  offshoots?: OffshootIF<ValueType>[];
  rollback(time: number, message: string): void;
  grow(change: ChangeIF<ValueType>): BranchIF<ValueType>;
  next(value: ValueType): void;
  value: ValueType;
}

export type ValidatorFn<TreeValueType> = (
  value: TreeValueType,
  tree: TreeIF<TreeValueType>
) => Error | void | undefined; // also throws

export type TreeParams<TreeValueType> = {
  initial?: TreeValueType;
  validator?: ValidatorFn<TreeValueType>;
};
