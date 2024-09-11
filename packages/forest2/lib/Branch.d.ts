import type { BranchIF } from "./types/types.branch";
import type { OffshootIF } from "./types";
import type { TreeIF } from "./types/types.trees";
import type { ChangeIF } from "./types/types.shared";
export declare class Branch<ValueType> implements BranchIF<ValueType> {
    readonly tree: TreeIF<ValueType>;
    readonly change: ChangeIF<ValueType>;
    constructor(tree: TreeIF<ValueType>, change: ChangeIF<ValueType>);
    get cause(): string;
    private _next?;
    get next(): BranchIF<ValueType> | undefined;
    set next(value: BranchIF<ValueType> | undefined);
    private _prev?;
    get prev(): BranchIF<ValueType> | undefined;
    set prev(value: BranchIF<ValueType> | undefined);
    readonly time: number;
    /**
     *
     * executes a "grow." note, it is not encapsulated by transaction
     *  and does not trigger watchers,
     *  so it should not be called directly by application code.
     */
    add(change: ChangeIF<ValueType>): BranchIF<ValueType>;
    offshoots?: OffshootIF<ValueType>[] | undefined;
    _cached: ValueType | undefined;
    _hasBeenCached: boolean | null;
    private _cacheValue;
    _resetCache(): ValueType;
    clone(toAssert?: boolean): BranchIF<ValueType>;
    get value(): ValueType;
    linkTo(branch: BranchIF<ValueType>): void;
    link(branchA: BranchIF<ValueType> | undefined, branchB: BranchIF<ValueType> | undefined): void;
    toString(): string;
    destroy(): void;
}
