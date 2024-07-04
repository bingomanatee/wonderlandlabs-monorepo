import type { LeafIF, TreeIF, ChangeBase, BranchIF, ChangeResponse } from "./types";
import type { BranchParams } from "./helpers/paramTypes";
import type { Status, BranchAction } from "./enums";
export declare class Branch implements BranchIF {
    tree: TreeIF;
    constructor(tree: TreeIF, params: BranchParams);
    cache?: Map<unknown, unknown> | undefined;
    readonly causeID?: string;
    /**
     * combine all active values from this branch downwards.
     * is intended to be called from a top branch.
     */
    mergedData(): Map<unknown, unknown>;
    readonly id: number;
    values(list?: Map<unknown, unknown> | undefined): Map<unknown, unknown>;
    private _initData;
    readonly data: Map<unknown, unknown>;
    readonly cause: BranchAction;
    readonly status: Status;
    next?: BranchIF | undefined;
    prev?: BranchIF | undefined;
    leaf(key: unknown): LeafIF;
    /**
     *
     * @param key {unknown}
     * @returns unknown
     */
    get(key: unknown): unknown;
    private leafFactory;
    private addBranch;
    has(key: unknown): boolean;
    set(key: unknown, val: unknown): unknown;
    del(key: unknown): void;
    async: boolean;
    change(c: ChangeBase<unknown, unknown>): ChangeResponse<unknown, unknown>;
}
