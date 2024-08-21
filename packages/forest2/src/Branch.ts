import type { BranchIF } from "./types.branch";
import type { OffshootIF } from "./types";
import type { ForestIF } from "./types.forest";
import { type TreeIF } from "./types.trees";
import { isMutator, type ChangeIF } from "./types.shared";

export class Branch<ValueType> implements BranchIF<ValueType> {
  constructor(
    public readonly tree: TreeIF<ValueType>,
    public readonly change: ChangeIF<ValueType>
  ) {
    this.time = tree.forest.nextTime;
  }

  private _next?: BranchIF<ValueType> | undefined;
  public get next(): BranchIF<ValueType> | undefined {
    return this._next;
  }
  public set next(value: BranchIF<ValueType> | undefined) {
    if (this === value) throw new Error('cannot self recurse');
    if (value && (this.prev === value)) throw new Error('cannot self recurse loop');
    this._next = value;
  }
  private _prev?: BranchIF<ValueType> | undefined;
  public get prev(): BranchIF<ValueType> | undefined {
    return this._prev;
  }
  public set prev(value: BranchIF<ValueType> | undefined) {
    if (this.prev === value) throw new Error ('cannot self-recurse')
      if (value &&( this.next === value)) throw new Error('cannot self recurse loop');
    this._prev = value;
  }
  public readonly time: number;

  add<SeedType = any>(change: ChangeIF<ValueType>): BranchIF<ValueType> {
    const nextBranch = new Branch<ValueType>(this.tree, change);
    this.link(this, nextBranch);
    return nextBranch;
  }
  offshoots?: OffshootIF<ValueType>[] | undefined;

  get value(): ValueType {
    if (isMutator<ValueType>(this.change)) {
      return this.change.next(this.prev, this.change.seed);
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

  toString() {
    return `branch ${this.time} of tree {${this.tree.name ?? '(anon)'}} - value = ${ this.value} next=${this.next ? this.next.time : '<null>'} prev=${this.prev ? this.prev.time : '<null>'}`
  }
}
