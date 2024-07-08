import type { LeafIF, TreeIF, ForestIF, TreeName, ChangeBase, BranchIF, ChangeResponse, TreeData } from "./types";
import { DataType } from "./helpers/enums";
import { TreeParams } from "./helpers/paramTypes";
/**
 * Tree is a "table" of records; a key/value store.
 */
export declare class Tree implements TreeIF {
    constructor(params: TreeParams);
    dataType: DataType;
    activeScopeCauseIDs: Set<string>;
    private makeBranch;
    endScope(scopeID: string): void;
    pruneScope(scopeID: string): void;
    get size(): number;
    values(): TreeData<unknown, unknown>;
    clearValues(): BranchIF[];
    get branches(): BranchIF[];
    forest: ForestIF;
    name: TreeName;
    root: BranchIF | undefined;
    get top(): BranchIF | undefined;
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
    private pushCurrentScope;
    set(key: unknown, val: unknown): void;
    del(key: unknown): void;
    get status(): symbol;
    change(c: ChangeBase): ChangeResponse;
}
