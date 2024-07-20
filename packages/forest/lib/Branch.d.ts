import { ActionDeltaArgs, ActionIF, BranchIF, TreeIF } from "./types";
export declare class Branch implements BranchIF {
    tree: TreeIF;
    action: ActionIF;
    data?: ActionDeltaArgs | undefined;
    constructor(tree: TreeIF, action: ActionIF, data?: ActionDeltaArgs | undefined);
    isAlive: boolean;
    private _cache;
    get value(): unknown;
    prev?: BranchIF | undefined;
    next?: BranchIF | undefined;
    push(branch: BranchIF): void;
    popMe(): BranchIF;
    cutMe(): BranchIF;
    destroy(): void;
    get isTop(): boolean;
    get isRoot(): boolean;
}
