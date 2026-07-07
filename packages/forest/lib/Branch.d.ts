import { MutatorArgs, MutatorIF, BranchIF, TreeIF } from "./types";
export declare class Branch<ValueType = unknown> implements BranchIF<ValueType> {
    tree: TreeIF<ValueType>;
    mutator: MutatorIF<ValueType>;
    input?: MutatorArgs | undefined;
    constructor(tree: TreeIF<ValueType>, mutator: MutatorIF<ValueType>, input?: MutatorArgs | undefined);
    isAlive: boolean;
    isCached: boolean;
    readonly id: number;
    private _cache;
    get value(): ValueType;
    private setCache;
    clearCache(): void;
    clearPrevCache(clear?: boolean): void;
    prev?: BranchIF<ValueType> | undefined;
    next?: BranchIF<ValueType> | undefined;
    push(branch: BranchIF<ValueType>): void;
    popMe(): BranchIF<ValueType>;
    cutMe(errorId: number): BranchIF<ValueType>;
    destroy(): void;
    get isTop(): boolean;
    get isRoot(): boolean;
}
