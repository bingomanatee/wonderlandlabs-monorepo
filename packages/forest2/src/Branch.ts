import type { BranchIF, OffshootIF } from "./types.branch";
import type { ForestIF } from "./types.forest";
import type { ChangeIF, TreeIF } from "./types.trees";

export class Branch<ValueType> implements BranchIF<ValueType> {
  constructor(
    public readonly tree: TreeIF<ValueType>,
    public readonly change: ChangeIF<ValueType>
  ) {}
  next?: BranchIF<ValueType>;
  prev?: BranchIF<ValueType>;

  add<SeedType = any>(change: ChangeIF<ValueType>): BranchIF<ValueType> {
    const nextBranch = new Branch<ValueType>(this.tree, change);
    this.link(this, nextBranch);
    return nextBranch;
  }
  offshoots?: OffshootIF<ValueType>[] | undefined;

  get value(): ValueType {
    return this.change.next(this, this.change.seed);
  }

  linkTo(branch: BranchIF<ValueType>) {
    return this.link(this, branch);
  }
  link(
    branchA: BranchIF<ValueType> | undefined,
    branchB: BranchIF<ValueType> | undefined
  ) {
    if (branchA) branchA.next = branchB;
    if (branchB) branchB.prev = branchA;
  }
}
