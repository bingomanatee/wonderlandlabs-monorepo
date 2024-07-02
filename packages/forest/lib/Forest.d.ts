import type { ForestIF, LeafIF, LeafReq, TreeIF, TreeName, LeafIdentityIF, ChangeResponse, TreeFactoryParams } from "./types";
export declare class Forest implements ForestIF {
    delete(treeName: TreeName | LeafIF, key?: unknown): ChangeResponse;
    trees: Map<String, TreeIF>;
    addTree(params: TreeFactoryParams): TreeIF;
    get(treeNameOrLeaf: TreeName | LeafIdentityIF, key?: unknown): LeafIF;
    set(treeNameOrLeaf: TreeName | LeafIF, key?: unknown, val?: unknown): ChangeResponse;
    private change;
    hasKey(treeName: TreeName, k: unknown): boolean;
    has(r: LeafReq<unknown>): boolean;
    hasAll(r: LeafReq<unknown>[]): boolean;
    hasTree(treeName: TreeName): boolean;
    tree(treeName: TreeName): TreeIF | undefined;
}
