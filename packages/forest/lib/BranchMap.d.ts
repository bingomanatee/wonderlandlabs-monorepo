import type { LeafIF, TreeIF, ChangeBase, BranchIF, ChangeResponse, BranchMapIF, IterFn } from "./types";
import type { BranchParams } from "./helpers/paramTypes";
import { BranchBase } from "./BranchBase";
export declare function linkBranches(a?: BranchIF, b?: BranchIF): void;
/**
 * TODO: compress sets of the same value at some point to reduce branch size.
 */
export declare class BranchMap extends BranchBase implements BranchMapIF {
    constructor(tree: TreeIF, params: BranchParams);
    forEach(fn: IterFn): void;
    /**
     * remove all references in this node.
     * assumes that extrenal references TO this node are adjusted elsewhere.
     */
    destroy(): void;
    cache?: Map<unknown, unknown> | undefined;
    /**
     * combine all active values from this branch downwards.
     * is intended to be called from a top branch.
     */
    mergedData(): Map<unknown, unknown>;
    /**
     *
     * @param list values returns all data from this brandch and onwards;
     * its assumed that the values call has been intialized from the root onwards.
     * Some of the values may be the DELETED symbol.
     *
     * @returns Map<key, value>
     */
    values(list?: Map<unknown, unknown> | undefined): Map<unknown, unknown>;
    protected _initData(config: BranchParams): Map<any, any>;
    readonly data: Map<unknown, unknown>;
    next?: BranchMapIF | undefined;
    prev?: BranchMapIF | undefined;
    leaf(key: unknown): LeafIF;
    /**
     * get PRESUMES that it has either been called from the top node,
     * or it is a recursive count from the top node.
     * @param key {unknown}
     * @returns unknown
     */
    get(key: unknown): unknown;
    has(key: unknown, local?: boolean): boolean;
    get forest(): import("./types").ForestIF;
    make(params: BranchParams): BranchMap;
    ensureCurrentScope(): void;
    set(key: unknown, val: unknown): unknown;
    del(key: unknown): void;
    change(c: ChangeBase<unknown, unknown>): ChangeResponse<unknown, unknown>;
}
