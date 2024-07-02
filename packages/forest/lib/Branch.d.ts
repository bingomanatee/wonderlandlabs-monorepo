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
    get(key: unknown): LeafIF;
    private leafFactory;
    private push;
    has(key: unknown): boolean;
    set(key: unknown, val: unknown): LeafIF;
    del(key: unknown): LeafIF<unknown, unknown>;
    async: boolean;
    change(c: ChangeBase<unknown, unknown>): ChangeResponse<unknown, unknown>;
}
