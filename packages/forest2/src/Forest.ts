import Tree from "./Tree";
import type { ForestIF, TaskFn } from "./types.forest";
import type { TreeName, TreeIF, TreeParams } from "./types.trees";

export class Forest {
  private trees: Map<TreeName, TreeIF<any>> = new Map();

  public hasTree(name: TreeName) {
    return this.trees.has(name);
  }

  tree<ValueType>(name: TreeName) {
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

  do<ResultType>(change: TaskFn<ResultType>) {
    const taskTime = this.nextTime;

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
  }
}