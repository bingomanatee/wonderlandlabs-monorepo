import { Tree } from './Tree';

import type { ForestIF } from './types/types.forest';
import type { TreeName, TreeIF, TreeParams } from './types/types.trees';
import {
  BehaviorSubject,
  combineLatest,
  Observable,
  filter,
  map,
  distinctUntilChanged,
} from 'rxjs';
import type { NotesMap, InfoParams, Info } from './types/types.shared';
import { isEqual } from 'lodash-es';
import { NotableHelper } from './NotableHelper';

function pad(n: number) {
  let str = `${n}`;
  while (str.length < 3) {
    str = '0' + str;
  }
  return str;
}

export class Forest implements ForestIF {
  uniqueTreeName(basis: string = 'tree'): string {
    if (!this.hasTree(basis)) {
      return basis;
    }
    let number = 1;

    while (this.hasTree(`${basis}-${pad(number)}`)) {
      number += 1;
    }

    return `${basis}-${pad(number)}`;
  }
  public readonly trees: Map<TreeName, TreeIF<any>> = new Map();

  public hasTree(name: TreeName) {
    return this.trees.has(name);
  }

  tree<ValueType>(name: TreeName): TreeIF<ValueType> | undefined {
    if (!this.hasTree(name)) {
      return undefined;
    }
    return this.trees.get(name) as TreeIF<ValueType>;
  }

  get treeNames() {
    return Array.from(this.trees.keys());
  }

  public addTree<ValueType>(name: TreeName, params?: TreeParams<ValueType>) {
    if (this.hasTree(name)) {
      throw new Error('cannot redefine $tree ' + name);
    }

    const tree: TreeIF<ValueType> = new Tree<ValueType>(name, params, this);
    return tree;
  }
  private _time = 0;

  get time() {
    return this._time;
  }
  get nextTime() {
    this._time = this._time + 1;
    return this.time;
  }

  public activeTaskSubject = new BehaviorSubject<Set<number>>(new Set());

  get activeTasks() {
    if (!this.activeTaskSubject.value.size) {
      return [];
    }

    return Array.from(this.activeTaskSubject.value.values());
  }

  do<F extends (...args: any[]) => any>(
    change: F,
    ...args: Parameters<F>
  ): ReturnType<F> {
    const taskTime = this.nextTime;
    this.addActiveTask(taskTime);
    try {
      const result: ReturnType<F> = change(...args);
      this.removeActiveTask(taskTime);
      return result;
    } catch (err) {
      this.removeActiveTask(taskTime);
      this.trees.forEach((tree) => {
        tree.rollback(
          taskTime,
          err instanceof Error ? err.message : 'unknown error'
        );
      });
      throw err;
    }
  }

  private addActiveTask(taskTime: number) {
    const newSet = new Set(this.activeTaskSubject.value);
    newSet.add(taskTime);
    this.activeTaskSubject.next(newSet);
  }

  private removeActiveTask(taskTime: number) {
    const newSet2 = new Set(this.activeTaskSubject.value);
    newSet2.delete(taskTime);
    this.activeTaskSubject.next(newSet2);
  }

  /**
   * observes value changes for a $tree when all 'do()' actions have completed.
   * meaning, if any errors are thrown and reset the values, no emissions are made.
   * distinct values mean that only values that are different are emitted.
   * @param name {string}
   * @returns
   */
  observe<ValueType>(name: TreeName) {
    if (!this.hasTree(name)) {
      throw new Error('cannot observe ' + name + ': no $tree by that name');
    }

    const tree = this.tree(name);
    if (!tree) {
      throw new Error('cannot observe ' + name + ': no $tree by that name exi');
    } // for typescript

    return combineLatest([ this.activeTaskSubject, tree.subject ]).pipe(
      filter(([ depth ]: [Set<number>, undefined]) => {
        return depth.size === 0;
      }),
      map(([ , value ]: [Set<number>, undefined]) => value),
      distinctUntilChanged(isEqual)
    ) as Observable<ValueType>;
  }
  // #region notable

  private _notes?: NotesMap;

  addNote(message: string, params?: InfoParams) {
    if (!this._notes) {
      this._notes = new Map();
    }
    NotableHelper.addNote(this.time, this._notes, message, params);
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
}
