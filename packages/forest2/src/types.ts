import type { BranchIF } from "./types/types.branch";

export type * as branchTypes from "./types/types.branch";
export type * as treeTypes from "./types/types.trees";
export interface OffshootIF<ValueType> {
  time: number;
  error: string;
  branch: BranchIF<ValueType>;
}

export type * as forestTypes from "./types/types.forest";
