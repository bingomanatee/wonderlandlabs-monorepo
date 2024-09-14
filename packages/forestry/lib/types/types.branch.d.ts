import type { TreeIF } from "./types.trees";
import type { ChangeIF } from "./types.shared";
export interface BranchIF<ValueType> {
    value: ValueType;
    cause: string;
    time: number;
    tree: TreeIF<ValueType>;
    next?: BranchIF<ValueType>;
    prev?: BranchIF<ValueType>;
    add(next: ChangeIF<ValueType>): BranchIF<ValueType>;
    clone(toAssert?: boolean): BranchIF<ValueType>;
    linkTo(branchB: BranchIF<ValueType> | undefined): void;
    valueIsCached: boolean;
    toString(): string;
    destroy(): void;
}
