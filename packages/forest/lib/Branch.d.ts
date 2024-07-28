import { MutatorArgs, MutatorIF, BranchIF, TreeIF } from "./types";
export declare class Branch implements BranchIF {
    tree: TreeIF;
    mutator: MutatorIF;
    input?: MutatorArgs | undefined;
    constructor(tree: TreeIF, mutator: MutatorIF, input?: MutatorArgs | undefined);
    isAlive: boolean;
    isCached: boolean;
    readonly id: number;
    private _cache;
    get value(): unknown;
    private setCache;
    clearCache(): void;
    clearPrevCache(clear?: boolean): void;
    prev?: BranchIF | undefined;
    next?: BranchIF | undefined;
    push(branch: BranchIF): void;
    popMe(): BranchIF;
    cutMe(errorId: number): BranchIF;
    destroy(): void;
    get isTop(): boolean;
    get isRoot(): boolean;
}
