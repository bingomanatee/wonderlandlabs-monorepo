import { A } from "@svgdotjs/svg.js";
import { ACTION_NAME_INITIALIZER } from "./constants";
import {
  ActionIF,
  ActionName,
  BranchIF,
  DataEngineIF,
  ForestIF,
  GenObj,
  TreeIF,
  TreeName,
  TreeSeed,
} from "./types";
import { Branch } from "./Branch";
import { join } from "./join";

const DEFAULT_INITIALIZER: ActionIF = {
  name: "DEFAULT_INITIALIZER",
  delta: function (_, modifier?: unknown): unknown {
    return (modifier as TreeSeed).val;
  },
};

export class Tree implements TreeIF {
  constructor(public forest: ForestIF, name: TreeName, seed: TreeSeed) {
    this.dataEngine = seed.dataEngine;
    // console.log("--- new tree", name, "seed", seed);

    if (this.engine.actions.has(ACTION_NAME_INITIALIZER)) {
      const action = this.engine.actions.get(ACTION_NAME_INITIALIZER)!;
      //  console.info("--- using aciton intiailizer", action);
      this.root = new Branch(this, action, seed);
    } else {
      this.root = new Branch(this, DEFAULT_INITIALIZER, seed);
      // console.log("---- tree initial root is ", this.root);
    }
  }
  root: BranchIF;
  public get top(): BranchIF {
    let b = this.root;
    while (b) {
      if (!b.next) return b;
      b = b.next;
    }
    return b;
  }
  dataEngine: string;
  get engine(): DataEngineIF {
    return this.forest.dataEngine(this.dataEngine);
  }
  get value() {
    return this.top.value;
  }
  do(name: ActionName, value?: unknown, options?: GenObj): BranchIF {
    const action = this.engine.actions.get(name);
    if (!action)
      throw new Error(
        "engine " + this.dataEngine + " does not have an action " + name
      );
    let next = new Branch(this, action, value, options);
    join(this.top, next);
    return next;
  }
}
