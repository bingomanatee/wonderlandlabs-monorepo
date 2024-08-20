import type { BranchIF } from "./types.branch";
import type { ForestIF } from "./types.forest";

export type TreeName = string;

export type ChangeFN<ValueType> = (
  branch: BranchIF<ValueType>,
  seed: any
) => ValueType;

export interface ChangeIF<ValueType, SeedType = unknown> {
  next: ChangeFN<ValueType>;
  seed: SeedType;
}

export interface TreeIF<ValueType> {
  name: TreeName;
  root: BranchIF<ValueType>;
  top: BranchIF<ValueType>;
  forest: ForestIF;
  grow(change: ChangeIF<ValueType>): BranchIF<ValueType>;
}
