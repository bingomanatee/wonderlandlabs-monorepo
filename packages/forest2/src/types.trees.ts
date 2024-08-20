import type { BranchIF, OffshootIF } from "./types.branch";
import type { ForestIF } from "./types.forest";

export type TreeName = string;

export type ChangeFN<ValueType> = (
  branch: BranchIF<ValueType>,
  seed: any
) => ValueType;

export interface Mutator<ValueType> {
  next: ChangeFN<ValueType>;
  seed?: any;
}

export function isMutator<ValueType>(a: unknown): a is Mutator<ValueType> {
  return !!(
    a &&
    typeof a === "object" &&
    "next" in a &&
    typeof a.next === "function"
  );
}

interface Assertion<ValueType> {
  next: ValueType;
}
export type ChangeIF<ValueType> = Mutator<ValueType> | Assertion<ValueType>;

export interface TreeIF<ValueType> {
  name?: TreeName;
  root?: BranchIF<ValueType>;
  top?: BranchIF<ValueType>;
  forest: ForestIF;
  offshoots?: OffshootIF<ValueType>[];
  rollback(time: number, message: string): void;
  grow(change: ChangeIF<ValueType>): BranchIF<ValueType>;

  value: ValueType;
}
export type TreeParams<TreeValueType> = {
  initial?: TreeValueType;
};
