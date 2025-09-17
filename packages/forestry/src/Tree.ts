import { BehaviorSubject, filter, map } from 'rxjs';
import type { Observer } from 'rxjs';
import { Branch } from './Branch';
import { Beaver } from './treeHelpers/Beaver';
import { BenchMarker } from './treeHelpers/BenchMarker';
import { PreValidator } from './treeHelpers/PreValidator';

import { NotableHelper } from './NotableHelper';
import type {
  TreeIF,
  TreeName,
  TreeParams,
  TreeValuation,
} from './types/types.trees';
import type { ForestIF } from './types/types.forest';
import type { BranchIF } from './types/types.branch';
import {
  ChangeIF,
  Info,
  InfoParams,
  MutationValueProviderFN,
  NotesMap,
  ObserverOrSubscribeFn,
  OffshootIF,
  UpdaterValueProviderFN,
} from './types/types.shared';

export const INITIAL_VALUE = 'INITIAL VALUE';

export class Tree<ValueType> implements TreeIF<ValueType> {
  constructor(
    public readonly name: TreeName,
    public readonly params: TreeParams<ValueType>,
    public forest: ForestIF
  ) {
    if (forest.hasTree(name)) {
      throw new Error('tree ' + name + ' exists');
    }
    this.initialize();

    this.stream = new BehaviorSubject<BranchIF<ValueType> | undefined>(
      this.top
    );
    this.forest.trees.set(name, this);
  }

  private initialize(throwIfBad = true) {
    if (this.validate(this.params.initial).isValid) {
      this.root = new Branch<ValueType>(this, {
        assert: this.params.initial,
        name: INITIAL_VALUE,
      });
      this.top = this.root;
    } else {
      this.root = undefined;
      this.top = undefined;
      if (throwIfBad) {
        throw new Error('intial value fails validator');
      }
    }
  }

  get dontCache(): boolean {
    if (!this.params) {
      return false;
    }
    return Boolean(this.params.dontCache);
  }

  private stream: BehaviorSubject<BranchIF<ValueType> | undefined>;

  next(next: ValueType, name: string = '(next)') {
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
      this.initialize();
    }
  }

  mutate(
    mutator: MutationValueProviderFN<ValueType>,
    seed?: unknown,
    name?: string
  ) {
    if (!name) {
      if (mutator.name) {
        this.grow({ mutator, seed, name: mutator.name });
      } else {
        this.grow({ mutator, seed, name: '(mutation)' });
      }
    } else {
      this.grow({ mutator, seed, name });
    }
    return this;
  }

  update(
    updater: UpdaterValueProviderFN<ValueType, any>,
    seed: any,
    name = ''
  ) {
    const updaterFn = updater as UpdaterValueProviderFN<ValueType, typeof seed>;
    const mutator: MutationValueProviderFN<ValueType, typeof seed> = ({
      value,
      seed,
    }) => updaterFn(value, seed);

    let growName: string = name ?? '';
    if (!growName && updaterFn.name) {
      growName = updaterFn.name;
    }
    if (!growName) {
      growName = '(update)';
    }

    this.grow({ mutator, seed, name: growName });

    return this;
  }

  offshoots?: OffshootIF<ValueType>[];
  root?: BranchIF<ValueType>;
  top?: BranchIF<ValueType>;

  grow(change: ChangeIF<ValueType>): BranchIF<ValueType> {
    return this.forest.do(() => {
      if (this.params.validator) {
        PreValidator.validate(change, this);
      }

      if (
        this.params.benchmarkInterval &&
        BenchMarker.shouldBenchmark<ValueType>(this, change)
      ) {
        new BenchMarker<ValueType>(this).benchmark(change);
        return this.top;
      }

      const next = new Branch<ValueType>(this, change);
      if (this.top) {
        this.top.linkTo(next);
      } else {
        this.root = next;
      }
      this.top = next;

      new Beaver(this).limitBranchLength();

      this.stream.next(this.top);
      return this.top;
    });
  }

  validate(value: ValueType): TreeValuation<ValueType> {
    if (!this.params.validator) {
      return {
        isValid: true,
        value,
        tree: this.name,
      };
    }
    try {
      const err = this.params.validator(value, this);
      if (err) {
        return {
          isValid: false,
          value,
          tree: this.name,
          error: err.message,
        };
      }
      return {
        isValid: true,
        value,
        tree: this.name,
      };
    } catch (err) {
      let msg = '';
      if (err instanceof Error) {
        msg = err.message;
      } else if (typeof err == 'string') {
        msg = err;
      } else {
        msg = `${err}`;
      }
      return {
        value,
        tree: this.name,
        isValid: false,
        error: msg,
      };
    }
  }

  get subject() {
    return this.stream.pipe(
      filter((b: BranchIF<ValueType> | undefined) => !!b),
      map((b: BranchIF<ValueType>) => b.value)
    );
  }

  subscribe(observer: ObserverOrSubscribeFn<ValueType>) {
    return this.subject.subscribe(observer);
  }

  observe(
    observer: Partial<Observer<ValueType>> | ((value: ValueType) => void)
  ) {
    return this.forest.observe<ValueType>(this.name).subscribe(observer);
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
      return undefined;
    }
    return this.top.value;
  }

  // #region notable

  private _notes?: NotesMap;

  addNote(message: string, params: InfoParams) {
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
   * returns the size of the $tree (number of branches)
   * because _in theory_ a $branch $tree can be enormous, we provide an upTo
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
    if (!this.top) {
      return 0;
    }

    let count = 0;
    let current = this.top;
    while ((!upTo || count < upTo) && current) {
      count += 1;
      current = current.prev;
    }

    return count;
  }

  // #region iterators

  forEachDown(
    iterator: (b: BranchIF<ValueType>, count: number) => true | void,
    maxBranches: number | null = null
  ): void {
    let b = this.top;
    let count = 0;

    while (b) {
      const out = iterator(b, count);
      if (out === true) {
        break;
      }
      count += 1;
      b = b.prev;
      if (maxBranches !== null && count >= maxBranches) {
        break;
      }
    }
  }

  forEachUp(
    iterator: (b: BranchIF<ValueType>, count: number) => true | void,
    maxBranches: number | null = null
  ): void {
    let b = this.root;
    let count = 0;

    while (b) {
      const out = iterator(b, count);
      if (out === true) {
        break;
      }
      count += 1;
      b = b.next;
      if (maxBranches !== null && count >= maxBranches) {
        break;
      }
    }
  }
}
