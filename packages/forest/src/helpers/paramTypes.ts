import { BranchIF } from "../types";
import { Action, DataType, Status } from "./enums";
import { TreeName, ForestIF } from "./../types";

export type LeafParams = {
  treeName: TreeName;
  key: unknown;
  val: unknown;
  forest?: ForestIF;
};

type TreeParamsBase = {
  data?: Map<unknown, unknown>;
  dataType?: DataType;
  name: TreeName;
};

export type AddTreeParams = {
  upsert?: boolean;
} & TreeParamsBase;

export type TreeParams = {
  forest: ForestIF;
} & TreeParamsBase;

export type BranchParams = {
  data?: Map<unknown, unknown>;
  prev?: BranchIF;
  status?: Status;
  cause: Action;
  causeID?: string;
};

export type ForestParams = {
  cacheInterval?: number;
};

export type ScopeParams = {
  scopeID?: string;
  name?: string;
  cause?: Action;
  status?: Status;
  async?: boolean;
};
