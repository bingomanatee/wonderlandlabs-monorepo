import type { BranchConfig, LeafIF, TreeIF, ChangeBase, BranchIF, ChangeResponse } from "./types";
import type { Status, BranchAction } from "./enums";
export declare class Branch implements BranchIF {
    tree: TreeIF;
    constructor(tree: TreeIF, config: BranchConfig);
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
