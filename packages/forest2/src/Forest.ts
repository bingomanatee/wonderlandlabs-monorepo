import Tree from "./Tree";

import type { ForestIF, TaskFn } from "./types.forest";
import type { TreeName, TreeIF, TreeParams } from "./types.trees";
import { BehaviorSubject } from "rxjs";

function pad(n: number) {
  let str = `${n}`;
  while (str.length < 3) str = "0" + str;
  return str;
}

export class Forest implements ForestIF {
  uniqueTreeName(basis: string = "tree"): string {
    if (!this.hasTree(basis)) return basis;
    let number = 1;

    while (this.hasTree(`${basis}-${pad(number)}`)) {
      number += 1;
    }

    return `${basis}-${pad(number)}`;
  }
  private trees: Map<TreeName, TreeIF<any>> = new Map();

  public hasTree(name: TreeName) {
    return this.trees.has(name);
  }

  tree<ValueType>(name: TreeName): TreeIF<ValueType> | undefined {
    if (!this.hasTree(name)) return undefined;
    return this.trees.get(name);
  }

  public addTree<ValueType>(name: TreeName, params?: TreeParams<ValueType>) {
    if (this.hasTree(name)) throw new Error("cannot redefine tree " + name);

    const tree: TreeIF<ValueType> = new Tree<ValueType>(this, name, params);
    this.trees.set(name, tree);
    return tree;
  }
  private _time = 0;

  get nextTime() {
    const time = this._time + 1;
    this._time = time;
    return time;
  }

  public depth = new BehaviorSubject<Set<number>>(new Set());

  do<ResultType>(change: TaskFn<ResultType>) {
    const taskTime = this.nextTime;
    const newSet = new Set(this.depth.value);
    newSet.add(taskTime);
    this.depth.next(newSet);
    try {
      const result = change(this);
      return result;
    } catch (err) {
      this.trees.forEach((tree) => {
        tree.rollback(
          taskTime,
          err instanceof Error ? err.message : "unknown error"
        );
      });
      throw err;
    }
    const newSet2 = new Set(this.depth.value);
    newSet2.delete(taskTime);
    this.depth.next(newSet2);
  }
}
