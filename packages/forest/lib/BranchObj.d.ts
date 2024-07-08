import type { LeafIF, TreeIF, ChangeBase, ChangeResponse, IterFn, GenObj, BranchObjIF } from "./types";
import type { BranchParams } from "./helpers/paramTypes";
import { BranchBase } from "./BranchBase";
/**
 * TODO: compress sets of the same value at some point to reduce branch size.
 */
export declare class BranchObj extends BranchBase implements BranchObjIF {
    constructor(tree: TreeIF, params: BranchParams);
    forEach(fn: IterFn): void;
    protected get root(): BranchObjIF | undefined;
    protected get top(): BranchObjIF | undefined;
    /**
     * remove all references in this node.
     * assumes that extrenal references TO this node are adjusted elsewhere.
     */
    destroy(): void;
    cache?: GenObj | undefined;
    /**
     * return the tree's current accumulated data.
     */
    mergedData$(): GenObj;
    /**
     *
     * @param list {GenObj}
     *
     * acumulate values from this and further branches and all subsequent branches
     * @returns GenObj
     */
    values(list?: GenObj): GenObj;
    protected _initData(config: BranchParams): any;
    readonly data: GenObj;
    get next$(): BranchObjIF | undefined;
    set next$(branch: BranchObjIF);
    get prev$(): BranchObjIF | undefined;
    set prev$(branch: BranchObjIF);
    leaf$(key: string): LeafIF;
    /**
     * get PRESUMES that it has either been called from the top node,
     * or it is a recursive count from the top node.
     * @param key {unknown}
     * @returns unknown
     */
    get(key: string): unknown;
    has(key: string, local?: boolean): boolean;
    get forest(): import("./types").ForestIF;
    make$(params: BranchParams): BranchObjIF;
    ensureCurrentScope(): void;
    set(key: string, val: unknown): unknown;
    del(key: string): void;
    change(c: ChangeBase<unknown, unknown>): ChangeResponse<unknown, unknown>;
}
