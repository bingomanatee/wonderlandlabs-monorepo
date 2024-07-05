import type {
  LeafIF,
  TreeIF,
  ForestIF,
  TreeName,
  ChangeBase,
  Data,
  BranchIF,
  ChangeResponse,
} from "./types";
import { BranchAction, BranchActionEnum, StatusEnum } from "./helpers/enums";
import { Branch } from "./Branch";
import { Leaf } from "./Leaf";
import { mp } from "./helpers";
import { isTreeSet } from "./helpers/isTreeSet";
import { isTreeDel } from "./helpers/isTreeDel";
import { DELETED, NOT_FOUND } from "./constants";

type TreeParams = {
  treeName: TreeName;
  forest: ForestIF;
  data?: Map<unknown, unknown>;
};
/**
 * Tree is a "table" of records; a key/value store.
 */
export class Tree implements TreeIF {
  constructor(params: TreeParams) {
    const { forest, treeName, data } = params;
    this.forest = forest;
    this.name = treeName;
    if (data)
      this.root = new Branch(this, { data, cause: BranchActionEnum.init });
  }
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
    let br: BranchIF | undefined = this.top;

    while (br) {
      if (br.causeID === scopeID) {
        br.prune();
        break;
      }
      br = br.next;
    }
    this.activeScopeCauseIDs.delete(scopeID);
  }
  get size() {
    let keys = new Set();
    let branch = this.root;

    while (branch) {
      branch.data.forEach((_, k) => keys.add(k));
      branch = branch.next;
    }
    return keys.size;
  }

  values(): Map<unknown, unknown> {
    if (!this.root) return new Map();
    return this.root.values();
  }

  clearValues() {
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
  private maybeCache(next: BranchIF) {
    return;
    let cacheDepth = 1;
    let cacheNext: BranchIF = next;
    while (cacheNext && cacheDepth < this.forest.cacheInterval) {
      if (!cacheNext.prev) break;
      cacheNext = cacheNext.prev!;
      cacheDepth += 1;
      if (cacheNext.cache) break;
    }

    if (cacheDepth >= this.forest.cacheInterval) {
      // next.cache = next.mergedData();
    }
  }

  private addBranch(key: unknown, val: unknown, cause: BranchAction) {
    const next = new Branch(this, {
      data: mp(key, val),
      cause: BranchActionEnum.set,
    });
    if (this.top) {
      next.prev = this.top;
      this.top.next = next;
      // this.maybeCache(next);
      return next;
    } else {
      this.root = next;
    }

    return next;
  }

  set(key: unknown, val: unknown): unknown {
    this.addBranch(key, val, BranchActionEnum.set);
    return this.top!.get(key);
  }

  del(key: unknown) {
    this.addBranch(key, DELETED, BranchActionEnum.del);
    return this.top!.get(key);
  }

  get status() {
    return StatusEnum.good;
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
