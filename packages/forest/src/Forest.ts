import { Tree } from "./Tree";
import {
  DataEngineIF,
  DataEngineName,
  ForestIF,
  TreeIF,
  TreeName,
  TreeSeed,
} from "./types";

export default class Forest implements ForestIF {
  constructor(engines: DataEngineIF[]) {
    engines.forEach((e) => this.dataEngine(e));
  }

  private trees: Map<TreeName, TreeIF> = new Map();
  private engines: Map<DataEngineName, DataEngineIF> = new Map();

  tree(name: TreeName, seed?: TreeSeed): TreeIF  {
    if (!seed) {
        if (!this.trees.has(name)) throw new Error('cannot find tree ' + name);
        return this.trees.get(name)!;
    }
    if (this.trees.has(name)) throw new Error("cannot redefine tree " + name);
    const newTree = new Tree(this, name, seed);
    this.trees.set(name, newTree);
    return newTree;
  }
  dataEngine(nameOrEngine: DataEngineName | DataEngineIF): DataEngineIF {
    if (typeof nameOrEngine === "string") {
      if (!this.engines.has(nameOrEngine)) {
        throw new Error("cannot find engine " + nameOrEngine);
      }
      return this.engines.get(nameOrEngine)!;
    }
    this.engines.set(nameOrEngine.name, nameOrEngine);
    return nameOrEngine;
  }
}
