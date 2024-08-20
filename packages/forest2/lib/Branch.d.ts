import type { BranchIF, OffshootIF } from "./types.branch";
import { type ChangeIF, type TreeIF } from "./types.trees";
export declare class Branch<ValueType> implements BranchIF<ValueType> {
    readonly tree: TreeIF<ValueType>;
    readonly change: ChangeIF<ValueType>;
    constructor(tree: TreeIF<ValueType>, change: ChangeIF<ValueType>);
    next?: BranchIF<ValueType>;
    prev?: BranchIF<ValueType>;
    readonly time: number;
    add<SeedType = any>(change: ChangeIF<ValueType>): BranchIF<ValueType>;
    offshoots?: OffshootIF<ValueType>[] | undefined;
    get value(): ValueType;
    linkTo(branch: BranchIF<ValueType>): void;
    link(branchA: BranchIF<ValueType> | undefined, branchB: BranchIF<ValueType> | undefined): void;
}
