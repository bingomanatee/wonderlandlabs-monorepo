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
