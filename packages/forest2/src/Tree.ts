import { Branch } from "./Branch";
import type { BranchIF } from "./types.branch";
import type { ForestIF } from "./types.forest";
import type { ChangeFN, ChangeIF, TreeIF, TreeName } from "./types.trees";

export default class Tree<TreeValueType> implements TreeIF<TreeValueType> {
  constructor(
    public forest: ForestIF,
    public name: TreeName,
    initial: TreeValueType
  ) {
    this.root = new Branch<TreeValueType>(this, {
      next: () => initial,
      seed: undefined,
    });
    this.top = this.root;
  }
  root: BranchIF<TreeValueType>;
  top: BranchIF<TreeValueType>;
  grow(change: ChangeIF<TreeValueType>): BranchIF<TreeValueType> {
    const next = new Branch<TreeValueType>(this, change);
    this.top.linkTo(next);
    return next;
  }
}

class Change<ValueType> implements ChangeIF<ValueType> {
  constructor(
    public readonly next: ChangeFN<ValueType>,
    public readonly seed: any
  ) {}
}
