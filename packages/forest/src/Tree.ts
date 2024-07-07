import type {
  LeafIF,
  TreeIF,
  ForestIF,
  TreeName,
  ChangeBase,
  BranchIF,
  ChangeResponse,
  TreeData,
} from "./types";
import {
  Action,
  Action_s as Action_s,
  DataType,
  DataType_s,
  Status_s,
} from "./helpers/enums";
import { BranchMap, linkBranches } from "./BranchMap";
import { Leaf } from "./Leaf";
import { mp } from "./helpers";
import { isTreeSet } from "./helpers/isTreeSet";
import { isTreeDel } from "./helpers/isTreeDel";
import { DELETED, NOT_FOUND } from "./constants";
import { TreeParams } from "./helpers/paramTypes";

/**
 * Tree is a "table" of records; a key/value store.
 */
export class Tree implements TreeIF {
  constructor(params: TreeParams) {
    const { forest, name: treeName, data } = params;
    this.forest = forest;
    this.name = treeName;
    this.dataType = params.dataType || DataType_s.map;
    if (data) this.root = new BranchMap(this, { data, cause: Action_s.init });
  }
  dataType: DataType;
  activeScopeCauseIDs: Set<string> = new Set();

  endScope(scopeID: string): void {
    let br: BranchIF | undefined = this.top;

    while (br) {
      if (br.causeID === scopeID) {
        br.pop();
        break;
      }
      br = br.next;
    }
    this.activeScopeCauseIDs.delete(scopeID);
  }
  pruneScope(scopeID: string): void {
    let br: BranchIF | undefined = this.root;

    let pruned = false;
    while (br) {
      if (br.causeID === scopeID) {
        br.prune();
        pruned = true;
        break;
      }

      br = br.next;
    }
    this.activeScopeCauseIDs.delete(scopeID);
  }
  // the number of unique keys in the data - INCLUDING DELETED REXORDS
  get size() {
    let keys = new Set();
    let branch = this.root;

    while (branch) {
      branch.forEach((_, k) => keys.add(k));
      branch = branch.next;
    }
    return keys.size;
  }

  values(): TreeData<unknown, unknown> {
    switch (this.dataType) {
      case DataType_s.map:
        if (!this.root) return new Map();
        return this.root.values() as Map<unknown, unknown>;
        break;

      case DataType_s.object:
        if (!this.root) return {};
        return this.root.values() as Record<string, unknown>;
        break;

      default:
        throw new Error("cannot manage type");
    }
  }

  clearValues() {
    if (!this.root) return [];
    if (this.forest.currentScope) {
      const clearBranch = new BranchMap(this, {
        cause: Action_s.clear,
      });
      this.top!.next = clearBranch;
      clearBranch.cache = new Map(); // block any downward reading of values -- "cloaking" the values with an empty map.
      return [];
    }
    const removed = this.branches;
    this.root = undefined;
    return removed;
  }

  get branches() {
    const out = [];
    let current = this.root;
    while (current) {
      out.push(current);
      current = current.next;
    }
    return out;
  }

  public forest: ForestIF;
  name: TreeName;
  root: BranchIF | undefined;
  get top() {
    if (!this.root) return undefined;
    let b = this.root;
    while (b) {
      if (!b.next) break;
      b = b.next;
    }
    return b;
  }

  leaf(key: unknown): LeafIF {
    if (!this.root) {
      return new Leaf({ treeName: this.name, key, val: NOT_FOUND });
    }
    return this.root.leaf(key);
  }

  get(key: unknown): unknown {
    if (!this.root) {
      return undefined;
    }
    return this.top?.get(key);
  }

  has(key: unknown): boolean {
    if (!this.root) return false;
    return !!this.top?.has(key);
  }

  /**
   * If fhere is not a cache (summary) of data within (this.forest.cacheInterval) branches,
   * append a summary of the data into next's cache.
   *
   * @param next {BranchIF}
   */
  private maybeCache() {
    const top = this.top;
    if (!top) return;

    if (this.count(this.forest.cacheInterval) >= this.forest.cacheInterval) {
      top.cache = top.mergedData();
    }
    // to garbage collect erace previous caches unless they are behind a scope.
    top.prev?.clearCache();
  }

  public count(stopAt = -1) {
    let c = 0;
    let n = this.top;
    while (n) {
      c += 1;
      n = n.prev;
      if (stopAt >= 0 && c >= stopAt) break;
    }
    return c;
  }

  private pushCurrentScope() {
    if (
      !this.forest.currentScope ||
      this.forest.currentScope.inTrees.has(this.name)
    ) {
      return;
    }
    this.forest.currentScope?.inTrees.add(this.name);
    const transBranch = new BranchMap(this, {
      cause: Action_s.trans,
      causeID: this.forest.currentScope.scopeID,
    });
    if (this.top) {
      linkBranches(this.top, transBranch);
    } else {
      this.root = transBranch;
    }
  }

  set(key: unknown, val: unknown) {
    if (this.forest.currentScope) {
      this.pushCurrentScope();
    }

    if (!this.root) {
      switch (this.dataType) {
        case DataType_s.map:
          this.root = new BranchMap(this, {
            data: new Map([[key, val]]),
            cause: Action_s.set,
          });
          break;

        case DataType_s.object:
          throw new Error("not implemented");
          break;

        default:
          throw new Error("bad dataType");
      }
    } else this.top?.set(key, val);
  }

  del(key: unknown) {
    if (!this.root || !this.top?.has(key)) return;

    if (this.forest.currentScope) {
      this.pushCurrentScope();
    }
    return this.top?.del(key);
  }

  get status() {
    return Status_s.good;
  }

  change(c: ChangeBase): ChangeResponse {
    if (isTreeSet(c)) {
      this.set(c.key, c.val);
      return { treeName: this.name, change: c, status: this.status };
    } else if (isTreeDel(c)) {
      //@ts-ignore
      this.del(c.key);
    } else {
      //@TODO: more change types
      throw new Error("not implemented");
    }
    return { treeName: this.name, change: c, status: this.status };
  }
}
