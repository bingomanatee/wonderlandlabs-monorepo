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
    activeScopeCauseIDs: Set<string>;
    endScope(scopeID: string): void;
    pruneScope(scopeID: string): void;
    get size(): number;
    values(): Map<unknown, unknown>;
    clearValues(): BranchIF<unknown, unknown>[];
    get branches(): BranchIF<unknown, unknown>[];
    forest: ForestIF;
    name: TreeName;
    root: BranchIF | undefined;
    get top(): BranchIF<unknown, unknown> | undefined;
    leaf(key: unknown): LeafIF;
    get(key: unknown): unknown;
    has(key: unknown): boolean;
    /**
     * If fhere is not a cache (summary) of data within (this.forest.cacheInterval) branches,
     * append a summary of the data into next's cache.
     *
     * @param next {BranchIF}
     */
    private maybeCache;
    count(stopAt?: number): number;
    private addBranch;
    set(key: unknown, val: unknown): unknown;
    del(key: unknown): unknown;
    get status(): symbol;
    change(c: ChangeBase): ChangeResponse;
}
export {};
