import type { BranchIF } from "./types.branch";
import type { OffshootIF } from "./types";
import type { ForestIF } from "./types.forest";
import type { TreeIF, TreeName, TreeParams } from "./types.trees";
import type { ChangeIF } from "./types.shared";
export default class Tree<TreeValueType> implements TreeIF<TreeValueType> {
    forest: ForestIF;
    readonly name: TreeName;
    private params?;
    constructor(forest: ForestIF, name: TreeName, params?: TreeParams<TreeValueType> | undefined);
    rollback(time: number, message: string): void;
    offshoots?: OffshootIF<TreeValueType>[];
    root?: BranchIF<TreeValueType>;
    top?: BranchIF<TreeValueType>;
    grow(change: ChangeIF<TreeValueType>): BranchIF<TreeValueType>;
    get value(): TreeValueType;
}
