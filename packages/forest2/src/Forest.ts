import type { TreeName, TreeIF } from "./types.trees";

export class Forest {
  private trees: Map<TreeName, TreeIF<unknown>> = new Map();

  public hasTree(name: TreeName) {
    return this.trees.has(name);
  }

  public addTree<ValueType = unknown>(name: TreeName, initial: ValueType) {
    if (this.hasTree(name)) throw new Error("cannot redefine tree " + name);

    this.trees.set(name, new Tree(this, name, initial));
  }
}
