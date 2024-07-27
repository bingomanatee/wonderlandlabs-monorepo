import { ACTION_NAME_INITIALIZER, CACHE_TOP_ONLY } from "./constants";
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
    this.id = tree.forest.nextID;
  }

  isAlive: boolean;
  isCached = false;
  public readonly id: number;

  private _cache: unknown = CACHE_UNSET;
  get value(): unknown {
    if (!this.isAlive) throw new Error("cannot get value from dead branch");
    // console.log("calling value from branch", this);

    if (this.action.cacheable) {
      if (!this.isCached) {
        if (this.action.cacheable === CACHE_TOP_ONLY) {
          if (this === this.tree.top) {
            this.setCache();
            return this._cache;
          }
        } else {
          this.setCache();
          return this._cache;
        }
      } else {
        return this._cache;
      }
    }

    return this.action.delta(this, this.data);
  }

  private setCache() {
    this._cache = this.action.delta(this, this.data);
    this.isCached = true;
    if (this.action.cacheable === CACHE_TOP_ONLY) {
      this.clearPrevCache();
    }
  }

  clearCache(){
    this._cache = undefined;
    this.isCached = false;
  }

  clearPrevCache(clear = false) {
    if (clear) {
      this.clearCache();
    }
    this.prev?.clearPrevCache(true);
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
  cutMe(errorId :number): BranchIF {
    if (!this.isAlive) throw new Error("cannot cut a dead branch");
    if (this.prev) {
      this.prev.next = this.next;
      this.prev = undefined;
    }
    this.tree.trimmed.push({
       id: this.id, 
       action: this.action.name,
       data: this.data,
       errorId
    })
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
