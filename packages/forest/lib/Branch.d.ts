import type { LeafIF, TreeIF, ChangeBase, BranchIF, ChangeResponse } from "./types";
import type { BranchConfig } from "./helpers/paramTypes";
import type { Status, BranchAction } from "./enums";
export declare class Branch implements BranchIF {
    tree: TreeIF;
    constructor(tree: TreeIF, config: BranchConfig);
    readonly id: number;
    values(list?: Map<unknown, unknown> | undefined): Map<unknown, unknown>;
    private _initData;
    data: Map<unknown, unknown>;
    cause: BranchAction;
    status: Status;
    next?: BranchIF | undefined;
    prev?: BranchIF | undefined;
    leaf(key: unknown): LeafIF;
    get(key: unknown): unknown;
    private leafFactory;
    private addBranch;
    has(key: unknown): boolean;
    set(key: unknown, val: unknown): unknown;
    del(key: unknown): void;
    async: boolean;
    change(c: ChangeBase<unknown, unknown>): ChangeResponse<unknown, unknown>;
}
