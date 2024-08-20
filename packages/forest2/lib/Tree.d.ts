import type { BranchIF, OffshootIF } from "./types.branch";
import type { ForestIF } from "./types.forest";
import type { ChangeIF, TreeIF, TreeName, TreeParams } from "./types.trees";
export default class Tree<TreeValueType> implements TreeIF<TreeValueType> {
    forest: ForestIF;
    readonly name: TreeName;
    constructor(forest: ForestIF, name: TreeName, params?: TreeParams<TreeValueType>);
    rollback(time: number, message: string): void;
    offshoots?: OffshootIF<TreeValueType>[];
    root?: BranchIF<TreeValueType>;
    top?: BranchIF<TreeValueType>;
    grow(change: ChangeIF<TreeValueType>): BranchIF<TreeValueType>;
    get value(): TreeValueType;
}
