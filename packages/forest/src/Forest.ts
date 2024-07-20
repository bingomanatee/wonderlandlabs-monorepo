import { Tree } from "./Tree";
import {
  DataEngineFactory,
  DataEngineIF,
  DataEngineName,
  EngineFactory,
  ForestIF,
  isDataEngineFactory,
  TransactFn,
  TreeIF,
  TreeName,
  TreeSeed,
} from "./types";

type EngineArgs = DataEngineName | DataEngineIF | DataEngineFactory;

export default class Forest implements ForestIF {
  constructor(engines: EngineArgs[]) {
    engines.forEach((e) => this.dataEngine(e));
  }

  private trees: Map<TreeName, TreeIF> = new Map();
  private engines: Map<DataEngineName, DataEngineIF | EngineFactory> =
    new Map();

  tree(name: TreeName, seed?: TreeSeed): TreeIF {
    if (!seed) {
      if (!this.trees.has(name)) throw new Error("cannot find tree " + name);
      return this.trees.get(name)!;
    }
    if (this.trees.has(name)) throw new Error("cannot redefine tree " + name);
    const newTree = new Tree(this, name, seed);
    this.trees.set(name, newTree);
    return newTree;
  }
  dataEngine(nameOrEngine: EngineArgs, tree?: TreeIF): DataEngineIF {
    if (typeof nameOrEngine === "string") {
      if (!this.engines.has(nameOrEngine)) {
        throw new Error("cannot find engine " + nameOrEngine);
      }
      let engine = this.engines.get(nameOrEngine)!;
      if (typeof engine === "function") {
        if (tree) return engine(tree);
        throw new Error("dataEngine(<string>, <tree>) requires a tree arg");
      }
      return engine as DataEngineIF;
    } else if (isDataEngineFactory(nameOrEngine)) {
      this.engines.set(nameOrEngine.name, nameOrEngine.factory);
      return nameOrEngine.factory(tree!);
    } else {
      const engine = nameOrEngine as DataEngineIF;
      this.engines.set(nameOrEngine.name, engine);
      return engine;
    }
  }

  private _nextID = 0;

  public get nextID() {
    this._nextID += 1;
    return this._nextID;
  }

  public transact(fn: TransactFn) {
    const transId = this.nextID;
    try {
      let out = fn();

      return out;
    } catch (err) {
      this.trees.forEach((tree) => tree.trim(transId));
      throw err;
    }
  }
}
