import { Branch } from "./Branch";
import type { BranchIF, OffshootIF } from "./types.branch";
import type { ForestIF } from "./types.forest";
import type { ChangeIF, TreeIF, TreeName, TreeParams } from "./types.trees";

export default class Tree<TreeValueType> implements TreeIF<TreeValueType> {
  constructor(
    public forest: ForestIF,
    public readonly name: TreeName,
    params?: TreeParams<TreeValueType>
  ) {
    if (params && "initial" in params) {
      const { initial } = params;
      if (initial !== undefined) {
        this.root = new Branch<TreeValueType>(this, {
          next: initial,
        });
        this.top = this.root;
      }
    }
  }

  rollback(time: number, message: string): void {
    if (!this.top) return;
    if (this.top.time < time) return;

    let firstObs = this.top;
    while (firstObs.prev && firstObs.prev.time >= time) {
      firstObs = firstObs.prev;
    }
    const offshoot: OffshootIF<TreeValueType> = {
      time,
      error: message,
      branch: firstObs,
    };
    if (!this.offshoots) {
      this.offshoots = [];
    }
    this.offshoots.push(offshoot);

    const last = firstObs.prev;

    if (last) {
      last.next = undefined;
    } else {
      this.root = undefined;
      this.top = undefined;
    }
  }

  offshoots?: OffshootIF<TreeValueType>[];
  root?: BranchIF<TreeValueType>;
  top?: BranchIF<TreeValueType>;
  grow(change: ChangeIF<TreeValueType>): BranchIF<TreeValueType> {
    const next = new Branch<TreeValueType>(this, change);
    if (this.top) {
      this.top.linkTo(next);
    } else {
      this.top = next;
      this.root = next;
    }
    return next;
  }

  get value() {
    if (!this.top) throw new Error("cannot get the value from an empty tree");
    return this.top.value;
  }
}
