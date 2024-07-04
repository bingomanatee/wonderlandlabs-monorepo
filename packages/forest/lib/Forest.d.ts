import type { ForestIF, LeafIF, LeafIdentityIF, TreeIF, TreeName, ChangeResponse } from "./types";
import type { TreeFactoryParams } from "./helpers/paramTypes";
export declare class Forest implements ForestIF {
    delete(treeName: TreeName | LeafIF, key?: unknown): ChangeResponse;
    trees: Map<String, TreeIF>;
    private _nextBranchId;
    nextBranchId(): number;
    addTree(params: TreeFactoryParams): TreeIF;
    get(treeNameOrLeaf: TreeName | LeafIdentityIF, key?: unknown): LeafIF;
    set(treeNameOrLeaf: TreeName | LeafIF, key?: unknown, val?: unknown): ChangeResponse;
    private change;
    hasKey(treeName: TreeName, k: unknown): boolean;
    has(r: LeafIdentityIF<unknown>): boolean;
    hasAll(r: LeafIdentityIF<unknown>[]): boolean;
    hasTree(treeName: TreeName): boolean;
    tree(treeName: TreeName): TreeIF | undefined;
}
