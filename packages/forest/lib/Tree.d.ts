import type { LeafIF, TreeIF, ForestIF, TreeName, ChangeBase, BranchIF, ChangeResponse } from "./types";
/**
 * Tree is a "table" of records; a key/value store.
 */
export declare class Tree implements TreeIF {
    forest: ForestIF;
    treeName: TreeName;
    constructor(forest: ForestIF, treeName: TreeName, data?: Map<unknown, unknown>);
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
