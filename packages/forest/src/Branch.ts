import { ACTION_NAME_INITIALIZER } from "./constants";
import { join } from "./join";
import { ActionDeltaArgs, ActionIF, BranchIF, GenObj, TreeIF } from "./types";

const CACHE_UNSET = Symbol("CACHE_UNSET");

export class Branch implements BranchIF {
  constructor(
    public tree: TreeIF,
    public action: ActionIF,
    public data?: ActionDeltaArgs // @TODO: maybe private?
  ) {
    this.isAlive = true;
  }
  isAlive: boolean;

  private _cache: unknown = CACHE_UNSET;
  get value(): unknown {
    if (!this.isAlive) throw new Error("cannot get value from dead branch");
    // console.log("calling value from branch", this);

    if (this.action.cacheable) {
      if (this._cache == CACHE_UNSET) {
        this._cache = this.action.delta(this, this.data);
      }
      return this._cache;
    }

    // if (this.action.name === ACTION_NAME_INITIALIZER) {
    //   console.log(this.tree.dataEngine, "value:get with", this.data);
    // }
    return this.action.delta(this, this.data);
  }

  prev?: BranchIF | undefined;
  next?: BranchIF | undefined;

  push(branch: BranchIF): void {
    if (this.next) {
      this.next.push(branch);
    } else {
      join(this, branch);
    }
  }
  popMe(): BranchIF {
    if (!this.isAlive) throw new Error("cannot pop a dead branch");

    join(this.prev, this.next);
    this.prev = undefined;
    this.next = undefined;
    this.isAlive = false;
    return this;
  }
  cutMe(): BranchIF {
    if (!this.isAlive) throw new Error("cannot cut a dead branch");
    if (this.prev) {
      this.prev.next = undefined;
      this.prev = undefined;
    }
    return this;
  }
  destroy(): void {
    if (!this.isAlive) {
      throw new Error("cannot destory a dead branch");
    }
    this.popMe();
    this._cache = CACHE_UNSET;
    //@ts-expect-error
    this.tree = undefined;
  }

  public get isTop(): boolean {
    if (!this.isAlive) return false;
    return !this.next;
  }

  public get isRoot(): boolean {
    if (!this.isAlive) return false;
    return this === this.tree.root;
  }
}
