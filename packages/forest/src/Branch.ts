import type {
  LeafIF,
  TreeIF,
  ChangeBase,
  BranchIF,
  ChangeResponse,
} from "./types";
import type { BranchParams } from "./helpers/paramTypes";

import type { Status, Action } from "./helpers/enums";
import { Status_s, Aciion_s, Change_s } from "./helpers/enums";
import { Leaf } from "./Leaf";
import { delToUndef, mp } from "./helpers";
import { DELETED, NOT_FOUND } from "./constants";
import { isTreeSet } from "./helpers/isTreeSet";
import { isTreeDel } from "./helpers/isTreeDel";

export function linkBranches(a?: BranchIF, b?: BranchIF) {
  if (a) {
    a.next = b;
  }
  if (b) {
    b.prev = a;
  }
}

export class Branch implements BranchIF {
  constructor(public tree: TreeIF, params: BranchParams) {
    this.cause = params.cause;
    if (params.causeID) {
      this.causeID = params.causeID;
    }
    this.status = "status" in params ? params.status! : Status_s.good;
    this.data = this._initData(params);
    if (params.prev) {
      this.prev = params.prev;
    }
    this.id = tree.forest.nextBranchId();
    //@TODO: validate.
  }
  clearCache(ignoreScopes: boolean): void {
    if (this.cause === Aciion_s.trans && !ignoreScopes) {
      return;
    }
    this.cache?.clear();
    this.cache = undefined;
    this.prev?.clearCache(!!ignoreScopes);
  }
  readonly causeID?: string;

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

  /**
   * remove this branch from the list chain; link the next and prev branches to each other
   */

  pop(): void {
    if (this == this.tree.root) {
      this.tree.root = this.next;
    }
    linkBranches(this.prev, this.next);
    this.destroy();
  }

  prune(): void {
    if (this == this.tree.root) {
      this.tree.root = undefined;
    }
    let toDestroy: BranchIF | undefined = this;
    let next;
    while (toDestroy) {
      next = toDestroy.next;
      toDestroy.destroy();
      toDestroy = next;
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
    let start: BranchIF = this;

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
        next.data.forEach((value, key) => {
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

  readonly id: number;

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

  private _initData(config: BranchParams) {
    if (config.data) {
      return config.data;
    }
    return new Map();
  }

  public readonly data: Map<unknown, unknown>;

  public readonly cause: Action;
  public readonly status: Status;
  next?: BranchIF | undefined;
  prev?: BranchIF | undefined;
  leaf(key: unknown): LeafIF {
    if (this.data.has(key)) {
      return this.leafFactory(key, this.data.get(key));
    }
    if (this.prev) {
      return this.prev.leaf(key);
    }
    return this.leafFactory(key, NOT_FOUND);
  }

  /**
   *
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
    if (this.prev) {
      return delToUndef(this.prev.get(key));
    }
    return undefined;
  }

  private leafFactory(k: unknown, v?: unknown) {
    return new Leaf({
      treeName: this.tree.name,
      key: k,
      val: v,
      forest: this.tree.forest,
    });
  }

  private addBranch(key: unknown, val: unknown, cause: Action): BranchIF {
    if (this.next) {
      throw new Error("cannot push on a non-terminal branch");
    }
    const next = new Branch(this.tree, {
      prev: this,
      data: mp(key, val),
      cause: cause,
    });
    this.next = next;
    return next;
  }

  has(key: unknown): boolean {
    if (this.data.has(key)) {
      return true;
    }
    if (this.prev) {
      return this.prev.has(key);
    }
    return false;
  }

  get forest() {
    return this.tree.forest;
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

    this.next = new Branch(this.tree, {
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
    this.tree.top!.ensureCurrentScope();
    if (this.next) {
      return this.next.set(key, val);
    }

    this.addBranch(key, val, Aciion_s.set);
    //@TODO: validate
    return this.next!.get(key);
  }

  del(key: unknown): void {
    if (this.next) {
      return this.next.del(key);
    }
    this.addBranch(key, DELETED, Change_s.del);
  }

  async = false;
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
