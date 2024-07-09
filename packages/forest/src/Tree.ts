import { A } from "@svgdotjs/svg.js";
import { ACTION_NAME_INITIALIZER } from "./constants";
import {
  ActionName,
  BranchIF,
  DataEngineIF,
  ForestIF,
  GenObj,
  TreeIF,
  TreeName,
  TreeSeed,
} from "./types";

export class Tree implements TreeIF {
  constructor(public forest: ForestIF, name: TreeName, seed: TreeSeed) {
    this.dataEngine = seed.dataEngine;
    let initialValue;
    if (this.engine.actions.has(ACTION_NAME_INITIALIZER)) {
      this.engine.actions.get(ACTION_NAME_INITIALIZER).generator(this, seed);
    } else if ("initialValue" in seed) {
      initialValue = seed.initialValue;
    } else {
      throw new Error(
        "cannot initialize tree of type " +
          seed.dataEngine +
          " without initialValue"
      );
    }

    this.root = new Branch(this, initialValue);
  }
  root: BranchIF;
  top: BranchIF;
  dataEngine: string;
  get engine(): DataEngineIF {
    return this.forest.dataEngine(this.dataEngine);
  }
  initialValue: unknown;
  value: unknown;
  do(name: ActionName, value?: unknown, options?: GenObj): BranchIF {
    throw new Error("Method not implemented.");
  }
}
