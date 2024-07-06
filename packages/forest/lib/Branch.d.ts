import type { LeafIF, TreeIF, ChangeBase, BranchIF, ChangeResponse } from "./types";
import type { BranchParams } from "./helpers/paramTypes";
import type { Status, Action } from "./helpers/enums";
export declare function linkBranches(a?: BranchIF, b?: BranchIF): void;
/**
 * TODO: compress sets of the same value at some point to reduce branch size.
 */
export declare class Branch implements BranchIF {
    tree: TreeIF;
    constructor(tree: TreeIF, params: BranchParams);
    clearCache(ignoreScopes: boolean): void;
    readonly causeID?: string;
    /**
     * remove all references in this node.
     * assumes that extrenal references TO this node are adjusted elsewhere.
     */
    destroy(): void;
    /**
     * remove this branch from the list chain; link the next and prev branches to each other
     */
    pop(): void;
    prune(): void;
    cache?: Map<unknown, unknown> | undefined;
    /**
     * combine all active values from this branch downwards.
     * is intended to be called from a top branch.
     */
    mergedData(): Map<unknown, unknown>;
    readonly id: number;
    /**
     *
     * @param list values returns all data from this brandch and onwards;
     * its assumed that the values call has been intialized from the root onwards.
     * Some of the values may be the DELETED symbol.
     *
     * @returns Map<key, value>
     */
    values(list?: Map<unknown, unknown> | undefined): Map<unknown, unknown>;
    private _initData;
    readonly data: Map<unknown, unknown>;
    readonly cause: Action;
    readonly status: Status;
    next?: BranchIF | undefined;
    prev?: BranchIF | undefined;
    leaf(key: unknown): LeafIF;
    /**
     * get PRESUMES that it has either been called from the top node,
     * or it is a recursive count from the top node.
     * @param key {unknown}
     * @returns unknown
     */
    get(key: unknown): unknown;
    private leafFactory;
    private addBranch;
    has(key: unknown, local?: boolean): boolean;
    get forest(): import("./types").ForestIF;
    ensureCurrentScope(): void;
    set(key: unknown, val: unknown): unknown;
    del(key: unknown): void;
    async: boolean;
    change(c: ChangeBase<unknown, unknown>): ChangeResponse<unknown, unknown>;
}
