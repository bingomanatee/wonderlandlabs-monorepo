import type {
  RefIF,
  TreeIF,
  ChangeBase,
  BranchIF,
  ChangeResponse,
  BranchMapIF,
  IterFn,
  TreeData,
  LeafIF,
} from "./types";
import type { BranchParams, TreeParams } from "./helpers/paramTypes";

import type { Status, Action } from "./helpers/enums";
import { Status_s, Action_s, Change_s, DataType_s } from "./helpers/enums";
import { Ref } from "./Ref";
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
export class Branch implements BranchIF {
  constructor(public tree: TreeIF, params: BranchParams) {
    const { cause, causeID } = params;
    this.id = tree.forest.nextBranchId();
    this.cause = cause;
    this.causeID = causeID;
    this.status = "status" in params ? params.status! : Status_s.good;
    this.leaf = this.tree.makeBranchData(this, params);
  }
  leaf: LeafIF;
  readonly id: number;
  readonly causeID?: string;
  //@ts-ignore
  public ref: BranchDataIF;
  public readonly cause: Action;
  public readonly status: Status;
  next?: BranchIF | undefined;
  prev?: BranchIF | undefined;

  protected get dataType() {
    return this.tree.dataType;
  }

  /**
   * remove all references in this node.
   * assumes that extrenal references TO this node are adjusted elsewhere.
   */
  destroy(): void {
    this.next = undefined;
    this.prev = undefined;

    if (this.causeID && this.tree.activeScopeCauseIDs.has(this.causeID)) {
      this.tree.activeScopeCauseIDs.delete(this.causeID);
    }
    this.leaf.destroy();
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

  //------------- helper shortcuts
  get forest() {
    return this.tree.forest;
  }
}
