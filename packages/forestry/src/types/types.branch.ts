import type { TreeIF } from './types.trees.ts';
import type { ChangeIF } from './types.shared.ts';

export interface BranchIF<ValueType> {
  value: ValueType;
  cause: string; // the 'name' of the change
  time: number;
  tree: TreeIF<ValueType>;
  next?: BranchIF<ValueType>;
  prev?: BranchIF<ValueType>;
  add(next: ChangeIF<ValueType>): BranchIF<ValueType>;
  clone(toAssert?: boolean): BranchIF<ValueType> // used in truncation -- don't call this yourself. 
  linkTo(branchB: BranchIF<ValueType> | undefined): void;
  valueIsCached: boolean;
  toString(): string;
  destroy(): void; // used in truncation -- don't call this yourself. will delete all properties of the branch. 
}
