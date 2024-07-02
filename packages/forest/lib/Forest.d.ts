import type { ForestIF, LeafIF, LeafReq, TreeIF, TreeName, LeafIdentityIF, ChangeResponse } from "./types";
export declare class Forest implements ForestIF {
    delete(treeName: TreeName | LeafIF, key?: unknown): ChangeResponse;
    trees: Map<String, TreeIF>;
    treeFactory(t: TreeName, m: Map<unknown, unknown>, upsert?: boolean | undefined): TreeIF;
    get(treeNameOrLeaf: TreeName | LeafIdentityIF, key?: unknown): LeafIF;
    set(treeNameOrLeaf: TreeName | LeafIF, key?: unknown, val?: unknown): ChangeResponse;
    private change;
    hasKey(t: TreeName, k: unknown): boolean;
    has(r: LeafReq<unknown>): boolean;
    hasAll(r: LeafReq<unknown>[]): boolean;
    hasTree(t: TreeName): boolean;
    tree(t: TreeName): TreeIF | undefined;
}
