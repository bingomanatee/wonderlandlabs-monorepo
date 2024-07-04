import { BranchIF } from "../types";
import { BranchAction } from "../enums";
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
export type BranchConfig = {
    data?: Map<unknown, unknown>;
    prev?: BranchIF;
    cause: BranchAction;
};
export type ForestParams = {
    cacheInterval?: number;
};
