import { Branch } from "./Branch";
import type { BranchIF } from "./types.branch";
import type { OffshootIF } from "./types";
import type { ForestIF } from "./types.forest";
import type { TreeIF, TreeName, TreeParams } from "./types.trees";
import type { ChangeIF } from "./types.shared";

export default class Tree<TreeValueType> implements TreeIF<TreeValueType> {
  constructor(
    public forest: ForestIF,
    public readonly name: TreeName,
    private params?: TreeParams<TreeValueType>
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
    this.top = last;

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
    return this.forest.do(() => {
      const next = new Branch<TreeValueType>(this, change);
      if (this.top) {
        this.top.linkTo(next);
      } else {
        this.root = next;
      }
      this.top = next;
      if (this.params?.validator) {
        const err = this.params.validator(next.value, this);
        if (err) throw err;
      }
      return next;
    });
  }

  get value() {
    if (!this.top) throw new Error("cannot get the value from an empty tree");
    return this.top.value;
  }
}
