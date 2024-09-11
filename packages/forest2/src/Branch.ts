import type { BranchIF } from './types/types.branch';
import type { OffshootIF } from './types';
import type { TreeIF } from './types/types.trees';
import type { ChangeIF } from './types/types.shared';
import { isAssert, isMutator } from './types/types.guards';
import { isCacheable } from './isCacheable';

export class Branch<ValueType> implements BranchIF<ValueType> {
  constructor(
    public readonly tree: TreeIF<ValueType>,
    public readonly change: ChangeIF<ValueType>
  ) {
    this.time = tree.forest.nextTime;
  }

  public get cause() {
    return this.change.name;
  }

  private _next?: BranchIF<ValueType> | undefined;
  public get next(): BranchIF<ValueType> | undefined {
    return this._next;
  }
  public set next(value: BranchIF<ValueType> | undefined) {
    if (this === value) {
      throw new Error('cannot self recurse');
    }
    if (value && this.prev === value) {
      throw new Error('cannot self recurse loop');
    }
    this._next = value;
  }
  private _prev?: BranchIF<ValueType> | undefined;
  public get prev(): BranchIF<ValueType> | undefined {
    return this._prev;
  }
  public set prev(value: BranchIF<ValueType> | undefined) {
    if (this.prev === value) {
      throw new Error('cannot self-recurse');
    }
    if (value && this.next === value) {
      throw new Error('cannot self recurse loop');
    }
    this._prev = value;
  }
  public readonly time: number;

  /**
   *
   * executes a "grow." note, it is not encapsulated by transaction
   *  and does not trigger watchers,
   *  so it should not be called directly by application code.
   */
  add(change: ChangeIF<ValueType>): BranchIF<ValueType> {
    if (this.next) {throw new Error('can only add at the end of a chain');}
    const nextBranch = new Branch<ValueType>(this.tree, change);
    this.link(this, nextBranch);
    return nextBranch;
  }
  offshoots?: OffshootIF<ValueType>[] | undefined;

  _cached: ValueType | undefined;
  _hasBeenCached: boolean | null = null;
  private _cacheValue(v: ValueType) {
    this._cached = v;
    this._hasBeenCached = true;
  }

  get value(): ValueType {
    if (this._hasBeenCached === true) {return this._cached;}
    if (isAssert(this.change)) {
      return this.change.assert;
    }
    if (
      isMutator<ValueType>(this.change) &&
      this._hasBeenCached === null // once it is checked it will be true | false.
    ) {
      const value = this.change.mutator(this.prev, this.change.seed);
      if (this._hasBeenCached === false) {return value;}

      if (this.tree.isUncacheable) {
        this._hasBeenCached = false; // stop trying to see if its cacheable or not.
        return value;
      }
      if (isCacheable(value)) {
        this._cacheValue(value);
      } else {
        this._hasBeenCached = false;
      }
      return value;
    }
    // ordinarily this should not be a possibility
    // @ts-expect-error
    return this.change.assert;
  }

  linkTo(branch: BranchIF<ValueType>) {
    return this.link(this, branch);
  }
  link(
    branchA: BranchIF<ValueType> | undefined,
    branchB: BranchIF<ValueType> | undefined
  ) {
    if (branchA) {
      branchA.next = branchB;
    }
    if (branchB) {
      branchB.prev = branchA;
    }
  }

  toString() {
    return `branch ${this.time} of tree {${this.tree.name ?? '(anon)'
    }} - value = ${this.value} next=${this.next ? this.next.time : '<null>'
    } prev=${this.prev ? this.prev.time : '<null>'}`;
  }
}
