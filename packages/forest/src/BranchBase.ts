import type {
  LeafIF,
  TreeIF,
  ChangeBase,
  BranchIF,
  ChangeResponse,
  BranchMapIF,
  IterFn,
  TreeData,
} from "./types";
import type { BranchParams, TreeParams } from "./helpers/paramTypes";

import type { Status, Action } from "./helpers/enums";
import { Status_s, Action_s, Change_s, DataType_s } from "./helpers/enums";
import { Leaf } from "./Leaf";
import { delToUndef, linkBranches, mp } from "./helpers";
import { DELETED, NOT_FOUND } from "./constants";
import { isTreeSet } from "./helpers/isChangeSet";
import { isTreeDel } from "./helpers/isTreeDel";

function destroyChain(branch?: BranchIF) {
  if (!branch) return;
  destroyChain(branch.next);
  branch.destroy();
}

/**
 * this is a pure base branch; all concrete implementations
 * have specific methods related to I/O of theier data types.
 * So any methods about reading/making data values are delegated to
 * implementing classes.
 */
export abstract class BranchBase implements BranchIF {
  constructor(public tree: TreeIF, params: BranchParams) {
    const { cause, causeID } = params;
    this.id = tree.forest.nextBranchId();
    this.cause = cause;
    this.causeID = causeID;
    this.status = "status" in params ? params.status! : Status_s.good;
  }
  mergeData() {
    throw new Error("Method not implemented.");
  }

  values(
    list?: TreeData<unknown, unknown> | undefined
  ): TreeData<unknown, unknown> {
    throw new Error("Method not implemented.");
  }

  mergedData(): TreeData<unknown, unknown> {
    throw new Error("Method not implemented.");
  }

  cache?: TreeData<unknown, unknown> | undefined;

  has(key: unknown, local?: boolean): boolean {
    throw new Error("Method not implemented.");
  }

  leaf(key: unknown): LeafIF {
    throw new Error("Not Implemented");
  }

  get(key: unknown): unknown {
    throw new Error("Not Implemented");
  }

  public make(parmas: BranchParams): BranchIF {
    throw new Error("not implemented");
  }

  set(key: unknown, val: unknown): unknown {
    throw new Error("not implemented");
  }

  del(key: unknown): void {
    throw new Error("not implemented");
  }

  //@ts-ignore
  public data: TreeData = {};

  protected get dataType() {
    return this.tree.dataType;
  }

  forEach(fn: IterFn): void {
    let stop = false;
    let stopFn = () => (stop = true);
    if (this.dataType === DataType_s.map) {
      for (const [key, val] of this.data as Map<unknown, unknown>) {
        fn(val, key, stopFn);
        if (stop) break;
      }
    } else if (this.dataType === DataType_s.object) {
      if (this.data instanceof Map) throw new Error("bad data"); // typescript sucks
      for (const key of Object.keys(this.data as Record<string, unknown>)) {
        const val = this.data[key];
        fn(val, key, stopFn);
        if (stop) break;
      }
    } else throw new Error("bad data for BranchMap");
  }

  clearCache(ignoreScopes: boolean): void {
    if (this.cause === Action_s.trans && !ignoreScopes) {
      return;
    }

    if (this.cache instanceof Map) this.cache?.clear();
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

    if (this.data instanceof Map) this.data.clear();
    if (this.cache instanceof Map) this.cache.clear();

    if (this.causeID && this.tree.activeScopeCauseIDs.has(this.causeID)) {
      this.tree.activeScopeCauseIDs.delete(this.causeID);
    }
  }

  /**
   * remove this branch from the list chain; link the next and prev branches to each other
   */

  pop(): void {
    if (this === this.tree.root) {
      this.tree.root = this.next;
    } else {
      linkBranches(this.prev, this.next);
    }
    this.destroy();
  }

  push(branch: BranchIF) {
    if (!branch) return;
    linkBranches(branch, this.next);
    linkBranches(this, branch);
  }

  prune(): void {
    let { tree, prev } = this;

    let nextBranch: BranchIF | undefined = this.next;

    if (this === tree.root) {
      tree.root = undefined;
    }
    if (prev) {
      prev.next = undefined;
    }
    destroyChain(this);
  }

  readonly id: number;

  public readonly cause: Action;
  public readonly status: Status;
  next?: BranchIF | undefined;
  prev?: BranchIF | undefined;

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

    this.next = this.make({
      cause: currentScope.cause,
      status: currentScope.status,
      causeID: currentScope.scopeID,
      prev: this,
    });

    // register that scope in the ids set to prevent redundant ensurance
    this.tree.activeScopeCauseIDs.add(currentScope.scopeID);
    currentScope.inTrees.add(this.tree.name);
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
