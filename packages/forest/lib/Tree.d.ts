import type { LeafIF, TreeIF, ForestIF, TreeName, ChangeBase, BranchIF, ChangeResponse } from "./types";
type TreeParams = {
    treeName: TreeName;
    forest: ForestIF;
    data?: Map<unknown, unknown>;
};
/**
 * Tree is a "table" of records; a key/value store.
 */
export declare class Tree implements TreeIF {
    constructor(params: TreeParams);
    get branches(): BranchIF<unknown, unknown>[];
    forest: ForestIF;
    name: TreeName;
    root: BranchIF | undefined;
    get top(): BranchIF<unknown, unknown> | undefined;
    leaf(key: unknown): LeafIF;
    get(key: unknown): unknown;
    has(key: unknown): boolean;
    private addBranch;
    set(key: unknown, val: unknown): unknown;
    del(key: unknown): unknown;
    get status(): symbol;
    change(c: ChangeBase): ChangeResponse;
}
export {};
