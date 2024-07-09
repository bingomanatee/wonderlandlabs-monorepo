import type {
  RefIF,
  TreeIF,
  ForestIF,
  TreeName,
  ChangeBase,
  BranchIF,
  ChangeResponse,
  LeafIF,
} from "./types";
import {
  Action_s as Action_s,
  DataType,
  DataType_s,
  Status_s,
} from "./helpers/enums";
import { Ref } from "./Ref";
import { linkBranches, mp } from "./helpers";
import { isTreeSet } from "./helpers/isChangeSet";
import { isTreeDel } from "./helpers/isTreeDel";
import { NOT_FOUND } from "./constants";
import { BranchParams, TreeParams } from "./helpers/paramTypes";
import { Branch } from "./Branch";

/**
 * Tree is a "table" of records; a key/value store.
 */
export class Tree implements TreeIF {
  constructor(params: TreeParams) {
    const { forest, name: treeName, data } = params;
    this.forest = forest;
    this.name = treeName;
    this.dataType = params.dataType || DataType_s.map;
    if (data)
      this.root = this.makeBranch({ data: params.data, cause: Action_s.init });
  }

  public forest: ForestIF;
  name: TreeName;
  dataType: DataType;
  root: BranchIF | undefined;

  makeBranchData(tree: BranchIF, params: BranchParams): LeafIF {
    throw new Error("Method not implemented.");
  }
  destroy(): void {
    throw new Error("Method not implemented.");
  }
  activeScopeCauseIDs: Set<string> = new Set();

  makeBranch(params: BranchParams) {
    return new Branch(this, params);
  }

  /**
   * complete a successful scope.
   * @param scopeID {string}
   */
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
  /**
   * destroy a failed scope
   * @param scopeID {string}
   */
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
    let branch: BranchIF | undefined = this.outerBranch();
    if (!branch) return 0;
    let keySet = new Set(branch?.leaf.keys);
    branch?.leaf.deletedKeys.forEach((dk) => keySet.delete(dk));
    branch = branch?.next;

    while (branch) {
      branch.leaf.keys.forEach((k) => keySet.add(k));
      branch.leaf.deletedKeys.forEach((dk) => keySet.delete(dk));
      branch = branch.next;
    }
    return keySet.size;
  }

  /**
   *
   * @returns {BranchIF} the most recent summary -- or the root of the tree.
   * A tree with no root will return undefined.
   */
  outerBranch(): BranchIF | undefined {
    if (!this.root) return undefined;
    let outer = this.top;
    while (outer) {
      if (outer.cause === Action_s.summary) return outer;
      if (!outer.prev) return outer;
      outer = outer.prev;
    }
    return outer;
  }

  /**
   * a user request to erase all values. 
   */
  clear() {
    if (!this.top) return;
    this.top.push(new Branch(this, {
      cause: Action_s.clear;
      data: undefined;
    }))
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

  get top() {
    if (!this.root) return undefined;
    let b = this.root;
    while (b) {
      if (!b.next) break;
      b = b.next;
    }
    return b;
  }

  ref(key: unknown): RefIF {
    return this.top?.leaf?.ref(key) ||  new Ref({treeName: this.name, key, val: NOT_FOUND})
  }

  get(key: unknown): unknown {
    if (!this.root) {
      return undefined;
    }
    return this.top?.leaf?.get(key);
  }

  has(key: unknown): boolean {
    return this.top?.leaf?.has(key) || false;
  }

  /**
   * If fhere is not a cache (summary) of data within (this.forest.cacheInterval) branches,
   * append a summary of the data into next's cache.
   *
   * @param next {BranchIF}
   */
  private maybeCache() {
    throw new Error('not implemented');
  }

  public count(stopAt = -1) {
    if (!this.top) return 0;
    let c = 0;
    let n: BranchIF | undefined = this.top;
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
    const transBranch = new Branch(this, {
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
    const setBranch = this.makeBranch({
      cause: Action_s.set, 
      data: {key, val}
    })
    if (!this.root) this.root = setBranch;
    else this.top?.push(setBranch);
  }

  del(key: unknown) {
    if (!this.root || !this.top?.leaf.has(key)) return;

    if (this.forest.currentScope) {
      this.pushCurrentScope();
    }
    return this.top?.leaf.del(key);
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
