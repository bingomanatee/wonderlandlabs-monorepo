import type { BranchIF } from "./types.branch";
import type { OffshootIF } from "./types";
import { type TreeIF } from "./types.trees";
import { type ChangeIF } from "./types.shared";
export declare class Branch<ValueType> implements BranchIF<ValueType> {
    readonly tree: TreeIF<ValueType>;
    readonly change: ChangeIF<ValueType>;
    constructor(tree: TreeIF<ValueType>, change: ChangeIF<ValueType>);
    private _next?;
    get next(): BranchIF<ValueType> | undefined;
    set next(value: BranchIF<ValueType> | undefined);
    private _prev?;
    get prev(): BranchIF<ValueType> | undefined;
    set prev(value: BranchIF<ValueType> | undefined);
    readonly time: number;
    add<SeedType = any>(change: ChangeIF<ValueType>): BranchIF<ValueType>;
    offshoots?: OffshootIF<ValueType>[] | undefined;
    get value(): ValueType;
    linkTo(branch: BranchIF<ValueType>): void;
    link(branchA: BranchIF<ValueType> | undefined, branchB: BranchIF<ValueType> | undefined): void;
    toString(): string;
}
