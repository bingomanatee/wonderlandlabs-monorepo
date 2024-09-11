import { Branch } from "./Branch";
import type { BranchIF } from "./types/types.branch";
import type { OffshootIF } from "./types";
import type { ForestIF } from "./types/types.forest";
import type {
  TreeIF,
  TreeName,
  TreeParams,
  TreeValuation,
} from "./types/types.trees";
import { hasCachingParams } from "./types/types.guards";
import type {
  ChangeIF,
  Info,
  InfoParams,
  NotesMap,
  SubscribeFn,
} from "./types/types.shared";
import { BehaviorSubject, filter, map } from "rxjs";
import type { PartialObserver } from "rxjs";
import { NotableHelper } from "./utils";

export const CLONE_NAME = "!CLONE!";

export default class Tree<ValueType> implements TreeIF<ValueType> {
  constructor(
    public forest: ForestIF,
    public readonly name: TreeName,
    public readonly params?: TreeParams<ValueType>
  ) {
    if (params && "initial" in params) {
      const { initial } = params;
      if (initial !== undefined) {
        this.root = new Branch<ValueType>(this, {
          assert: initial,
          name: "initial",
        });
        this.top = this.root;
      }
    }

    this.stream = new BehaviorSubject<BranchIF<ValueType> | undefined>(
      this.top
    );
  }

  get isUncacheable(): boolean {
    if (!this.params) {
      return false;
    }
    return Boolean(this.params.uncacheable);
  }

  private stream: BehaviorSubject<BranchIF<ValueType> | undefined>;

  next(next: ValueType, name: string = "(next)") {
    this.grow({ assert: next, name });
  }

  rollback(time: number, message: string): void {
    if (!this.top) {
      return;
    }
    if (this.top.time < time) {
      return;
    }

    let firstObs = this.top;

    while (firstObs.prev && firstObs.prev.time >= time) {
      firstObs = firstObs.prev;
    }
    const offshoot: OffshootIF<ValueType> = {
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

  offshoots?: OffshootIF<ValueType>[];
  root?: BranchIF<ValueType>;
  top?: BranchIF<ValueType>;
  grow(change: ChangeIF<ValueType>): BranchIF<ValueType> {
    return this.forest.do(() => {
      const next = new Branch<ValueType>(this, change);
      if (this.top) {
        this.top.linkTo(next);
      } else {
        this.root = next;
      }
      this.top = next;
      if (this.params?.validator) {
        const err = this.params.validator(next.value, this);
        if (err) {
          throw err;
        }
      }

      this._maybeCache();
      this._maybeTrim();

      this.stream.next(this.top);
      return this.top;
    });
  }

  validate(value: ValueType): TreeValuation<ValueType> {
    if (!this.params?.validator) {
      return {
        isValid: true,
        value,
        tree: this,
      };
    }

    try {
      const err = this.params.validator(value, this);
      if (err) {
        return {
          isValid: false,
          value,
          tree: this,
          error: err.message,
        };
      }
    } catch (err) {
      let msg = "";
      if (err instanceof Error) {
        msg = err.message;
      } else if (typeof err == "string") {
        msg = err;
      } else {
        msg = `${err}`;
      }
      return {
        value,
        tree: this,
        isValid: false,
        error: msg,
      };
    }
  }

  _maybeCache() {
    if (!this.top || !hasCachingParams(this.params)) {
      return;
    }

    const { cloneInterval, cloner } = this.params;

    let check = this.top;
    let count = 0;
    while (check) {
      if (count >= cloneInterval) {
        const clonedValue: ValueType = cloner(this.top);

        try {
          const next = this.top?.add({
            assert: clonedValue,
            name: CLONE_NAME,
          });
          this.top = next;
        } catch (e) {
          console.warn("cannot clone! error is ", e);
        }
        return;
      }
      if (check.cause == CLONE_NAME) {
        return;
      }
      count += 1;
      check = check.prev;
    }
  }

  _maybeTrim() {
    if (!(this.top && this.params?.cloner)) {
      return;
    }

    const { maxBranches, trimTo, cloner } = this.params;
    if (trimTo >= maxBranches * 0.8) {
      throw new Error("your trim size must be 80% of your maxBranches or less");
    }
    if (trimTo < 4) {
      throw new Error("your maxBranches must be >= 4");
    }

    const activeTasks = this.forest.activeTasks;

    let endTime = this.top.time;
    let startTime = this.root.time;
    const treeTime = endTime + startTime + 1;

    if (treeTime < maxBranches) {
      return; // its impossible for there to exist branch overflow if not enough time has passed
    }

    const count = this.branchCount(maxBranches + 1);
    if (count <= maxBranches) {
      return;
    }

    if (activeTasks.length) {
      const firstTimeToSave = activeTasks.reduce((m, n) => {
        return Math.min(m, n);
      }, Number.POSITIVE_INFINITY);

      this._trim(trimTo, firstTimeToSave);
    } else {
      this._trim(trimTo, Number.POSITIVE_INFINITY, true);
    }
  }

  /**
   *
   * in interest of economy we seek out two branches:
   *  1 the first branch AFTER the first task in play (because we can't trim above that)
   * 2 the earliest branch up to or past the max count (becuase we always want to trim below that).
   *
   * We trim to the LOWEST of these two branches;
   */
  private _trim(maxCount: number, firstTimeToSave: number, ignoreTime = false) {
    let fromBottom = this.root;
    let fromTop = this.top;

    if (!ignoreTime && fromBottom.time >= firstTimeToSave) return;
    let count = 0;

    while (fromTop && count < maxCount) {
      fromTop = fromTop.prev;
      if (
        !ignoreTime &&
        fromBottom &&
        fromBottom.time &&
        fromBottom.time < firstTimeToSave
      ) {
        fromBottom = fromBottom.next;
      }
      count += 1;
    }
    if (!fromTop || count < maxCount) return;

    // at this point if fromBottom exists it is at or a lttle past the earliest time.

    if (!ignoreTime) {
      while (fromBottom && fromBottom.time >= firstTimeToSave) {
        // ensure that we are preserving the branch BEFORE the eariest pending event
        fromBottom = fromBottom.prev;
      }
    }

    if (ignoreTime || fromTop.time < firstTimeToSave) {
      // we are trimming before or at the first event to save
      this._trimBefore(fromTop);
    } else {
      // there is an event prior to the size-based cutoff; trim to that event
      this._trimBefore(fromBottom);
    }
  }

  private _trimBefore(branch?: BranchIF<ValueType>) {
    if (!branch || !branch.prev || branch.prev === this.root) return;
    const oldRoot = this.root;

    // create an artificial branch that has the value and time of the previous branch
    // but has an asserted not computed value.
    const seedBranch = branch.clone(true);
    Branch.unlink(seedBranch.prev, seedBranch);
    Branch.link(seedBranch, seedBranch.next);
    this.root = seedBranch;
    // chain the new artificial branch to the trim target
    this._destoryOldData(oldRoot, seedBranch);
  }

  /**
   * this method erases all references contained in branches from the parameter forward.
   *
   * @param fromBranch
   */
  private _destoryOldData(
    fromBranch: BranchIF<ValueType> | undefined,
    toBranch: BranchIF<ValueType> | undefined
  ) {
    let next: BranchIF<ValueType> | undefined;
    // because destruction removes prev/next link we
    // presere the "next to destroy" before calling `destroy()`.
    while (fromBranch) {
      if (fromBranch.time >= toBranch?.time) return;
      next = fromBranch.next;
      fromBranch.destroy();
      fromBranch = next;
    }
  }

  get subject() {
    return this.stream.pipe(
      filter((b: BranchIF<ValueType> | undefined) => !!b),
      map((b: BranchIF<ValueType>) => b.value)
    );
  }

  subscribe(observer: PartialObserver<ValueType> | SubscribeFn<ValueType>) {
    return this.subject.subscribe(observer);
  }

  valueAt(at: number): ValueType | undefined {
    if (!this.top) {
      return undefined;
    }

    let mostRecent = this.top;
    while (mostRecent) {
      if (mostRecent.time > at) {
        mostRecent = mostRecent.prev;
      } else {
        break;
      }
    }
    if (mostRecent) {
      return mostRecent.value;
    }
    return undefined;
  }

  get value() {
    if (!this.top) {
      throw new Error("cannot get the value from an empty tree");
    }
    return this.top.value;
  }

  // #region notable

  private _notes?: NotesMap;

  addNote(message: string, params?: InfoParams) {
    if (!this._notes) {
      this._notes = new Map();
    }
    NotableHelper.addNote(
      this.forest.time,
      this._notes,
      message,
      params,
      this.name
    );
  }

  hasNoteAt(time: number) {
    return this._notes?.has(time) || false;
  }

  notes(fromTime: number, toTime: number = 0): Info[] {
    if (!this._notes) {
      return [];
    }

    return NotableHelper.notes(this._notes, fromTime, toTime);
  }
  // #endregion

  /**
   *
   * returns the size of the tree (number of branches)
   * because _in theory_ a branch tree can be enormous, we provide an upTo
   * value - past which branches are not counted. For instance if upTo = 50
   * then the return value is going to be 0...50.
   *
   * if upTo is falsy, the true length of the branches
   * will be returned however deep that may be
   *
   * @param {number} upTo
   * @returns
   */
  branchCount(upTo?: number): number {
    if (!this.top) return 0;

    let count = 0;
    let current = this.top;
    while ((!upTo || count < upTo) && current) {
      count += 1;
      current = current.prev;
    }

    return count;
  }
}
