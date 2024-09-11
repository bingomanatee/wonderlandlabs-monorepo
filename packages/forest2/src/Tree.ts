import { Branch } from './Branch';
import type { BranchIF } from './types/types.branch';
import type { OffshootIF } from './types';
import type { ForestIF } from './types/types.forest';
import type {
  TreeIF,
  TreeName,
  TreeParams,
  TreeValuation,
} from './types/types.trees';
import { hasCachingParams } from './types/types.guards';
import type {
  ChangeIF,
  Info,
  InfoParams,
  NotesMap,
  SubscribeFn,
} from './types/types.shared';
import { BehaviorSubject, filter, map } from 'rxjs';
import type { PartialObserver } from 'rxjs';
import { NotableHelper } from './utils';

export const CLONE_NAME = '!CLONE!';

export default class Tree<ValueType> implements TreeIF<ValueType> {
  constructor(
    public forest: ForestIF,
    public readonly name: TreeName,
    private params?: TreeParams<ValueType>
  ) {
    if (params && 'initial' in params) {
      const { initial } = params;
      if (initial !== undefined) {
        this.root = new Branch<ValueType>(this, {
          assert: initial,
          name: 'initial',
        });
        this.top = this.root;
      }
    }

    this.stream = new BehaviorSubject<BranchIF<ValueType> | undefined>(
      this.top
    );
  }

  get isUncacheable(): boolean {
    if (!this.params) {return false;}
    return Boolean(this.params.uncacheable);
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
      let msg = '';
      if (err instanceof Error) {msg = err.message;}
      else if (typeof err == 'string') {msg = err;}
      else {
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
        const clonedValue: ValueType = cloner(this);

        try {
          const next = this.top?.add({
            assert: clonedValue,
            name: CLONE_NAME,
          });
          this.top = next;
          if (this.name === 'counter:cached') {
            console.log(
              'added top:',
              this.top.time,
              this.top.value,
              this.top.cause
            );
          }
        } catch (e) {
          console.warn('cannot clone! error is ', e);
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
    if (!this.top) {return undefined;}

    let mostRecent = this.top;
    while (mostRecent) {
      if (mostRecent.time > at) {mostRecent = mostRecent.prev;}
      else {break;}
    }
    if (mostRecent) {return mostRecent.value;}
    return undefined;
  }

  get value() {
    if (!this.top) {
      throw new Error('cannot get the value from an empty tree');
    }
    return this.top.value;
  }

  // #region notable

  private _notes?: NotesMap;

  addNote(message: string, params?: InfoParams) {
    if (!this._notes) {this._notes = new Map();}
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
    if (!this._notes) {return [];}

    return NotableHelper.notes(this._notes, fromTime, toTime);
  }
  // #endregion
}
