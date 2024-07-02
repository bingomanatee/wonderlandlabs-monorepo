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
    forest: ForestIF;
    treeName: TreeName;
    root: BranchIF | undefined;
    get top(): BranchIF<unknown, unknown> | undefined;
    get(key: unknown): LeafIF;
    has(key: unknown): boolean;
    private push;
    set(key: unknown, val: unknown): LeafIF;
    del(key: unknown): LeafIF<unknown, unknown>;
    get status(): symbol;
    async: boolean;
    change(c: ChangeBase): ChangeResponse;
}
export {};
