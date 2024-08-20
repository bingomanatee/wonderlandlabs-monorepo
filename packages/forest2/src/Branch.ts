import type { BranchIF, OffshootIF } from "./types.branch";
import type { ForestIF } from "./types.forest";
import { isMutator, type ChangeIF, type TreeIF } from "./types.trees";

export class Branch<ValueType> implements BranchIF<ValueType> {
  constructor(
    public readonly tree: TreeIF<ValueType>,
    public readonly change: ChangeIF<ValueType>
  ) {
    this.time = tree.forest.nextTime;
  }

  next?: BranchIF<ValueType>;
  prev?: BranchIF<ValueType>;
  public readonly time: number;

  add<SeedType = any>(change: ChangeIF<ValueType>): BranchIF<ValueType> {
    const nextBranch = new Branch<ValueType>(this.tree, change);
    this.link(this, nextBranch);
    return nextBranch;
  }
  offshoots?: OffshootIF<ValueType>[] | undefined;

  get value(): ValueType {
    if (isMutator<ValueType>(this.change)) {
      return this.change.next(this, this.change.seed);
    }
    return this.change.next;
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
