import type {
  LeafIF,
  TreeIF,
  ChangeBase,
  BranchIF,
  ChangeResponse,
  BranchMapIF,
  IterFn,
} from "./types";
import type { BranchParams } from "./helpers/paramTypes";

import type { Status, Action } from "./helpers/enums";
import { Status_s, Action_s, Change_s, DataType_s } from "./helpers/enums";
import { Leaf } from "./Leaf";
import { delToUndef, mp } from "./helpers";
import { DELETED, NOT_FOUND } from "./constants";
import { isTreeSet } from "./helpers/isTreeSet";
import { isTreeDel } from "./helpers/isTreeDel";
import { BranchBase } from "./BranchBase";

export function linkBranches(a?: BranchIF, b?: BranchIF) {
  if (a) {
    a.next = b;
  }
  if (b) {
    b.prev = a;
  }
}

/**
 * TODO: compress sets of the same value at some point to reduce branch size.
 */
export class BranchMap extends BranchBase implements BranchMapIF {
  constructor(tree: TreeIF, params: BranchParams) {
    super(tree, params);
    this.data = this._initData(params);
    if (params.prev) {
      this.prev = params.prev as BranchMapIF;
    }
    //@TODO: validate.
  }
  forEach(fn: IterFn): void {
    let stop = false;
    let stopFn = () => (stop = true);
    if (this.tree.dataType === DataType_s.map) {
      for (const [key, val] of this.data as Map<unknown, unknown>) {
        fn(val, key, stopFn);
        if (stop) break;
      }
    } else {
      throw new Error("bad data for BranchMap");
    }
  }

  /**
   * remove all references in this node.
   * assumes that extrenal references TO this node are adjusted elsewhere.
   */
  destroy(): void {
    this.next = undefined;
    this.prev = undefined;
    this.data.clear();
    this.cache?.clear();
    if (this.causeID && this.tree.activeScopeCauseIDs.has(this.causeID)) {
      this.tree.activeScopeCauseIDs.delete(this.causeID);
    }
  }

  cache?: Map<unknown, unknown> | undefined;

  /**
   * combine all active values from this branch downwards.
   * is intended to be called from a top branch.
   */
  mergedData(): Map<unknown, unknown> {
    if (this.cache) {
      return this.cache;
    }
    let start: BranchMapIF | undefined = this;

    while (start) {
      if (!start.prev) {
        break;
      }
      if (start.cache) {
        break;
      }
      start = start.prev;
    }
    if (!start) {
      return new Map();
    }

    let merged = new Map(start.cache || start.data);

    let next = start.next;

    while (next) {
      if (next.cache) {
        merged = new Map(next.cache);
      } else {
        next.forEach((value, key) => {
          merged.set(key, value);
        });
      }

      if (next === this) {
        break;
      }
      next = next.next;
    }

    return merged;
  }

  /**
   *
   * @param list values returns all data from this brandch and onwards;
   * its assumed that the values call has been intialized from the root onwards.
   * Some of the values may be the DELETED symbol.
   *
   * @returns Map<key, value>
   */
  values(list?: Map<unknown, unknown> | undefined): Map<unknown, unknown> {
    if (this.cache) {
      list = new Map(this.cache);
    } else {
      if (!list) {
        list = new Map(this.data);
      } else {
        this.data.forEach((value, key) => {
          list!.set(key, value);
        });
      }
    }
    return this.next ? this.next.values(list) : list;
  }

  protected _initData(config: BranchParams) {
    if (config.data) {
      return config.data;
    }
    return new Map();
  }

  public readonly data: Map<unknown, unknown>;

  next?: BranchMapIF | undefined;
  prev?: BranchMapIF | undefined;

  leaf(key: unknown): LeafIF {
    return new Leaf({
      key,
      val: this.get(key),
      treeName: this.tree.name,
    });
  }

  /**
   * get PRESUMES that it has either been called from the top node,
   * or it is a recursive count from the top node.
   * @param key {unknown}
   * @returns unknown
   */
  get(key: unknown): unknown {
    if (this.data.has(key)) {
      return delToUndef(this.data.get(key));
    }
    if (this.cache) {
      if (this.cache.has(key)) {
        return delToUndef(this.cache.get(key));
      }
      return undefined;
    }
    let branch = this.prev;
    // rather than recurse we iterate backwards to limit call depth
    while (branch) {
      if (branch.has(key, true)) {
        return branch.get(key);
      }
      if (branch.cache) {
        return undefined;
      }
      branch = branch.prev;
    }
    return undefined;
  }

  has(key: unknown, local?: boolean): boolean {
    if (this.cache?.has(key)) return true;
    if (this.data.has(key)) return true;
    if (local) return false;
    if (this.prev) return this.prev.has(key);
    return false;
  }

  get forest() {
    return this.tree.forest;
  }

  make(params: BranchParams) {
    return new BranchMap(this.tree, params);
  }

  public ensureCurrentScope() {
    // check to see if there is an active, current scope in the forest.
    if (
      !this.forest.currentScope ||
      this.forest.currentScope.status !== Status_s.pending
    ) {
      return;
    }

    // check to see if thie active scope has been ensured already
    if (this.tree.activeScopeCauseIDs.has(this.forest.currentScope.scopeID)) {
      return;
    }

    // ensure the currentScope will be asserted over the topmost branch
    if (this.tree.top !== this.tree.top) {
      return this.tree.top?.ensureCurrentScope();
    }

    const { currentScope } = this.forest;

    // add a branch describing the current scope

    this.next = new BranchMap(this.tree, {
      cause: currentScope.cause,
      status: currentScope.status,
      causeID: currentScope.scopeID,
      prev: this,
    });

    // register that scope in the ids set to prevent redundant ensurance
    this.tree.activeScopeCauseIDs.add(currentScope.scopeID);
    currentScope.inTrees.add(this.tree.name);
  }

  set(key: unknown, val: unknown): unknown {
    const top = this.tree.top;
    if (this !== top) return top?.set(key, val);
    this!.ensureCurrentScope();
    const branch: BranchMapIF = this.make({
      data: new Map([[key, val]]),
      cause: Action_s.set,
    }) as BranchMapIF;
    this.push(branch);
  }

  del(key: unknown): void {
    if (this.next) {
      return this.next.del(key);
    }
    const branch = this.make({
      data: new Map([[key, DELETED]]),
      cause: Action_s.del,
    });
    this.push(branch);
  }

  change(c: ChangeBase<unknown, unknown>): ChangeResponse<unknown, unknown> {
    if (isTreeSet(c)) {
      this.set(c.key, c.val);
    } else if (isTreeDel(c)) {
      this.del(c.key);
    } else {
      throw new Error("cannot implement change " + c.type.toString());
    }
    return {
      treeName: c.treeName,
      change: c,
      status: Status_s.good,
    };
  }
}
