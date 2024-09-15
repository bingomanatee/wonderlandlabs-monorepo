import type { BranchIF } from './types/types.branch';
import type { OffshootIF } from './types';
import type { TreeIF } from './types/types.trees';
import { type ChangeIF } from './types/types.shared';
import { ValueProviderContext } from './types/ValueProviderContext';
import { isAssert, isMutator } from './types/types.guards';
import { isCacheable } from './isCacheable';

export class Branch<ValueType> implements BranchIF<ValueType> {
  constructor(
    public readonly tree: TreeIF<ValueType>,
    public readonly change: ChangeIF<ValueType>
  ) {
    if (!tree || !change) {throw new Error('unparameterized branch');}

    this.time = change && 'time' in change ? change.time : tree.forest.nextTime;
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
      throw new Error('next: cannot self recurse');
    }
    if (value && this.prev === value) {
      throw new Error('next: prev: cannot self recurse loop');
    }
    this._next = value;
  }
  private _prev?: BranchIF<ValueType> | undefined;
  public get prev(): BranchIF<ValueType> | undefined {
    return this._prev;
  }
  public set prev(value: BranchIF<ValueType> | undefined) {
    if (this === value) {
      throw new Error('prev: cannot self-recurse');
    }
    if (value && this.next === value) {
      throw new Error('prev:next:cannot self recurse loop');
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
    if (this.next) {
      throw new Error('can only add at the end of a chain');
    }
    const nextBranch = new Branch<ValueType>(this.tree, change);
    Branch.link(this, nextBranch);
    return nextBranch;
  }
  offshoots?: OffshootIF<ValueType>[] | undefined;

  _cached: ValueType | undefined;
  _hasBeenCached: boolean | null = null;
  private _cacheValue(v: ValueType) {
    this._cached = v;
    this._hasBeenCached = true;
  }

  get valueIsCached() {
    return this._hasBeenCached === true;
  }

  _flushCache() {
    // clear out any non-top caches; use cached value one last time.
    const out = this._cached;
    delete this._cached;
    this._hasBeenCached = null;
    return out;
  }

  clone(toAssert?: boolean): BranchIF<ValueType> {
    const value = this.tree.params?.serializer
      ? this.tree.params.serializer({
        branch: this,
        tree: this.tree,
        context: ValueProviderContext.truncation,
        value: this.value
      })
      : this.value;
    const change = toAssert
      ? { assert: value, name: 'cloned', time: this.time }
      : this.change;
    const out = new Branch(this.tree, change);
    out.prev = this.prev;
    out.next = this.next;
    return out;
  }

  get value(): ValueType {
    if (!this.change)
    {throw new Error('cannot get value of branch without change');}
    if (this._hasBeenCached) {
      if (this !== this.tree.top) {
        // only the top tre maintains a local cache; other branches return their cache but delete it
        return this._flushCache();
      }
      return this._cached;
    }

    if (isAssert(this.change)) {
      return this.change.assert;
    }
    if (isMutator<ValueType>(this.change)) {
      const value = this.change.mutator({
        branch: this.prev, 
        seed: this.change.seed,
        context: ValueProviderContext.mutation, 
        tree: this.tree,
        value: this.prev?.value
      });

      if (this._hasBeenCached === false) {
        // stop trying to see if its cacheable or not, return directly
        return value;
      }

      if (this.tree.isUncacheable) {
        this._hasBeenCached = false; // stop trying to see if its cacheable or not.
        return value;
      }
      if (this === this.tree.top) {this._cacheValue(value);}
   
      return value;
    }
    console.warn(
      'impossible changeType',
      this.change,
      isAssert(this.change),
      isMutator(this.change),
      this
    );
    throw new Error('impossible');
  }

  linkTo(branch: BranchIF<ValueType>) {
    return Branch.link(this, branch);
  }
  static link(
    branchA: BranchIF<unknown> | undefined,
    branchB: BranchIF<unknown> | undefined
  ) {
    if (branchA) {
      branchA.next = branchB;
    }
    if (branchB) {
      branchB.prev = branchA;
    }
  }

  static unlink(
    branchA: BranchIF<unknown> | undefined,
    branchB: BranchIF<unknown> | undefined
  ) {
    if (branchA) {
      branchA.next = undefined;
    }
    if (branchB) {
      branchB.prev = undefined;
    }
  }

  toString() {
    return `branch ${this.time} of tree {${
      this.tree.name ?? '(anon)'
    }} - value = ${this.value} next=${
      this.next ? this.next.time : '<null>'
    } prev=${this.prev ? this.prev.time : '<null>'}`;
  }

  destroy() {
    this.next = null;
    this.prev = null;
    this._cacheValue = undefined;
    // @ts-expect-error
    this.tree = undefined;
    // @ts-expect-error
    this.change = undefined;
  }
}
