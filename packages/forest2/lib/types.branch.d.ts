import type { TreeIF } from "./types.trees";
import type { ChangeIF } from "./types.shared";
export type ChangeFN<ValueType> = (prev: BranchIF<ValueType> | undefined, seed?: any) => ValueType;
export interface BranchIF<ValueType> {
    value: ValueType;
    time: number;
    tree: TreeIF<ValueType>;
    next?: BranchIF<ValueType>;
    prev?: BranchIF<ValueType>;
    add(change: ChangeIF<ValueType>): BranchIF<ValueType>;
    link(branchA: BranchIF<ValueType> | undefined, branchB: BranchIF<ValueType> | undefined): void;
    linkTo(branchB: BranchIF<ValueType> | undefined): void;
    toString(): string;
}
