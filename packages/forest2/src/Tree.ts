import { Branch } from "./Branch";
import type { BranchIF } from "./types.branch";
import type { OffshootIF } from "./types";
import type { ForestIF } from "./types.forest";
import type { TreeIF, TreeName, TreeParams } from "./types.trees";
import type { ChangeIF, SubscribeFn } from "./types.shared";
import { BehaviorSubject, Subject, filter, map } from "rxjs";
import type { PartialObserver } from "rxjs";
const UNINITIALIZED = Symbol("tree has no value");

export default class Tree<ValueType> implements TreeIF<ValueType> {
  constructor(
    public forest: ForestIF,
    public readonly name: TreeName,
    private params?: TreeParams<ValueType>
  ) {
    if (params && "initial" in params) {
      const { initial } = params;
      if (initial !== undefined) {
        this.root = new Branch<ValueType>(this, {
          next: initial,
        });
        this.top = this.root;
      }
    }

    this.stream = new BehaviorSubject<BranchIF<ValueType> | undefined>(
      this.top
    );
  }

  private stream: BehaviorSubject<BranchIF<ValueType> | undefined>;

  next(next: ValueType) {
    this.grow({ next });
  }

  rollback(time: number, message: string): void {
    if (!this.top) return;
    if (this.top.time < time) return;

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
        if (err) throw err;
      }

      this.stream.next(this.top);

      return next;
    });
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

  get value() {
    if (!this.top) throw new Error("cannot get the value from an empty tree");
    return this.top.value;
  }
}
