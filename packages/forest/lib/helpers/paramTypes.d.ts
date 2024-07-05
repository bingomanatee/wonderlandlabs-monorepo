import { BranchIF } from "../types";
import { BranchAction, Status } from "./enums";
import { TreeName, ForestIF } from "./../types";
export type LeafParams = {
  treeName: TreeName;
  key: unknown;
  val: unknown;
  forest?: ForestIF;
};
export type TreeFactoryParams = {
  name: TreeName;
  data?: Map<unknown, unknown>;
  upsert?: boolean;
};
export type BranchParams = {
  data?: Map<unknown, unknown>;
  prev?: BranchIF;
  status?: Status;
  cause: BranchAction;
  causeID?: string;
};
export type ForestParams = {
  cacheInterval?: number;
};
export type ScopeParams = {
  scopeID?: string;
  name?: string;
  cause?: BranchAction;
  status?: Status;
  async?: boolean;
};
