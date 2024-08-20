import type { ChangeIF, TreeIF } from "./types.trees";

export interface OffshootIF<ValueType> {
  time: number;
  error: string;
  BranchIF: BranchIF<ValueType>;
}
export interface BranchIF<ValueType> {
  value: ValueType;
  tree: TreeIF<ValueType>;
  next?: BranchIF<ValueType>;
  prev?: BranchIF<ValueType>;
  add<SeedType = unknown>(change: ChangeIF<ValueType>): BranchIF<ValueType>;
  offshoots?: OffshootIF<ValueType>[];

  link(
    branchA: BranchIF<ValueType> | undefined,
    branchB: BranchIF<ValueType> | undefined
  ): void;
  linkTo(branchB: BranchIF<ValueType> | undefined): void;
}
