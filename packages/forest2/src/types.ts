import type { BranchIF } from './types.branch';

export type * as branchTypes from './types.branch';
export type * as treeTypes from './types.trees';
export interface OffshootIF<ValueType> {
  time: number;
  error: string;
  branch: BranchIF<ValueType>;
}

export type * as forestTypes from './types.forest';
