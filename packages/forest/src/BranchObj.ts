import type {
  LeafIF,
  TreeIF,
  ChangeBase,
  BranchIF,
  ChangeResponse,
  BranchMapIF,
  IterFn,
  GenObj,
  BranchObjIF,
} from "./types";
import type { BranchParams } from "./helpers/paramTypes";

import type { Status, Action } from "./helpers/enums";
import { Status_s, Action_s, Change_s, DataType_s } from "./helpers/enums";
import { Leaf } from "./Leaf";
import { delToUndef, findPrevBranch, mp } from "./helpers";
import { DELETED, NOT_FOUND } from "./constants";
import { isTreeSet } from "./helpers/isChangeSet";
import { isTreeDel } from "./helpers/isTreeDel";
import { BranchBase } from "./BranchBase";
import { isObj } from "./helpers/isObj";

function destroyObj(obj?: GenObj) {
  if (!isObj(obj)) return;

  for (const key of Object.keys(obj)) {
    delete obj[key];
  }
}

/**
 * TODO: compress sets of the same value at some point to reduce branch size.
 */
export class BranchObj extends BranchBase implements BranchObjIF {
  constructor(tree: TreeIF, params: BranchParams) {
    super(tree, params);
    this.data = this._initData(params);
    if (params.prev) {
      this.prev$ = params.prev as BranchObjIF;
    }
    //@TODO: validate.
  }
  forEach(fn: IterFn): void {
    let stop = false;
    let stopFn = () => (stop = true);
    const keys = Object.keys(this.data);
    if (this.tree.dataType === DataType_s.map) {
      for (const key of keys) {
        fn(this.data[key], key, stopFn);
        if (stop) break;
      }
    } else {
      throw new Error("bad data for BranchMap");
    }
  }
  protected get root(): BranchObjIF | undefined {
    if (!this.tree?.root) {
      console.warn("branch has a tree without a root, or no tree");
      return undefined;
    }
    return this.tree.root as BranchObjIF;
  }
  protected get top(): BranchObjIF | undefined {
    if (!this.tree?.top) {
      console.warn("branch has a tree without a root, or no tree");
      return undefined;
    }
    return this.tree.top as BranchObjIF;
  }

  /**
   * remove all references in this node.
   * assumes that extrenal references TO this node are adjusted elsewhere.
   */
  destroy(): void {
    this.next = undefined;
    this.prev = undefined;
    destroyObj(this.data);
    destroyObj(this.cache);
    if (this.causeID && this.tree.activeScopeCauseIDs.has(this.causeID)) {
      this.tree.activeScopeCauseIDs.delete(this.causeID);
    }
  }

  cache?: GenObj | undefined;

  /**
   * return the tree's current accumulated data.
   */
  mergedData$(): GenObj {
    // note - top and root must be true if this has a tree
    //@ts-ignore
    if (this !== this.top) return this.top!.mergedData();

    // first process - find the first node with a cache -- if any exist
    const lastCachedBranch = findPrevBranch(
      this as BranchIF,
      (b: BranchIF) => b.cache
    ) as BranchObjIF;
    if (lastCachedBranch) {
      /**
       * if there is a cached branch AND it has no subseuqent brnanches return the cache.
       * otherwise accumulate from the next branch onwards, seeding with the cache.
       */
      return lastCachedBranch.next$
        ? lastCachedBranch.next$.values(lastCachedBranch.cache)
        : { ...lastCachedBranch.cache };
    } else {
      // in the absence of a cache, build the values up from an empty obj starting with root
      return this.root!.values({});
    }
  }

  /**
   *
   * @param list {GenObj}
   *
   * acumulate values from this and further branches and all subsequent branches
   * @returns GenObj
   */
  values(list?: GenObj): GenObj {
    let branch: BranchObjIF | undefined = this;
    let out = list || {};
    while (branch) {
      if (branch.cache) {
        out = branch.cache;
      } else {
        out = { ...out, ...branch.data };
      }
      branch = branch.next$;
    }
    return out;
  }

  protected _initData(config: BranchParams) {
    if (config.data) {
      if (typeof config.data !== "object") {
        throw new Error("BranchObj: data must be obj");
      }
      return config.data;
    }
    return new Map();
  }

  public readonly data: GenObj;

  get next$(): BranchObjIF | undefined {
    if (!this.next) return undefined;
    return this.next as BranchObjIF;
  }
  set next$(branch: BranchObjIF) {
    this.next = branch ? (branch as BranchIF) : undefined;
  }

  get prev$(): BranchObjIF | undefined {
    if (!this.prev) return undefined;
    return this.prev as BranchObjIF;
  }
  set prev$(branch: BranchObjIF) {
    this.prev = branch ? (branch as BranchIF) : undefined;
  }
  leaf$(key: string): LeafIF {
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
  get(key: string): unknown {
    if (key in this.data) {
      return delToUndef(this.data[key]);
    }
    if (this.cache) {
      if (key in this.cache) {
        return delToUndef(this.cache[key]);
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
        // if a cached branch doesn't have value presume all prev branches don't either.
        return undefined;
      }
      branch = branch.prev;
    }
    return undefined;
  }

  has(key: string, local?: boolean): boolean {
    if (this.cache && key in this.cache) return true;
    if (key in this.data) return true;
    if (local) return false;
    if (this.prev) return this.prev.has(key);
    return false;
  }

  get forest() {
    return this.tree.forest;
  }

  make$(params: BranchParams) {
    return new BranchObj(this.tree, params) as BranchObjIF;
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

    this.next$ = this.make$({
      cause: currentScope.cause,
      status: currentScope.status,
      causeID: currentScope.scopeID,
      prev: this,
    });

    // register that scope in the ids set to prevent redundant ensurance
    this.tree.activeScopeCauseIDs.add(currentScope.scopeID);
    currentScope.inTrees.add(this.tree.name);
  }

  set(key: string, val: unknown): unknown {
    const top = this.tree.top;
    if (this !== top) return top?.set(key, val);
    this!.ensureCurrentScope();
    const branch = this.make$({
      data: { [key]: val },
      cause: Action_s.set,
    });
    this.push(branch);
  }

  del(key: string): void {
    if (this.next$) {
      return this.next$.del(key);
    }
    const branch = this.make$({
      data: { [key]: DELETED },
      cause: Action_s.del,
    });
    this.push(branch);
  }

  change(c: ChangeBase<unknown, unknown>): ChangeResponse<unknown, unknown> {
    if (isTreeSet(c)) {
      this.set(c.key as string, c.val);
    } else if (isTreeDel(c)) {
      this.del(c.key as string);
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
