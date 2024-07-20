import { A } from "@svgdotjs/svg.js";
import { ACTION_NAME_INITIALIZER } from "./constants";
import {
  ActionDeltaArgs,
  ActionIF,
  ActionName,
  BranchIF,
  DataEngineIF,
  ForestIF,
  TreeIF,
  TreeName,
  TreeSeed,
} from "./types";
import { Branch } from "./Branch";
import { join } from "./join";

const DEFAULT_INITIALIZER: ActionIF = {
  name: "DEFAULT_INITIALIZER",
  delta: function (_, args: ActionDeltaArgs): unknown {
    return args[0];
  },
};

export class Tree implements TreeIF {
  constructor(public forest: ForestIF, public name: TreeName, seed: TreeSeed) {
    this.dataEngine = seed.dataEngine;
    const init = [seed.val];
    console.log(seed.dataEngine, "init is ", init);
    const action = this.engine.actions.has(ACTION_NAME_INITIALIZER)
      ? this.engine.actions.get(ACTION_NAME_INITIALIZER)!
      : DEFAULT_INITIALIZER;
    this.root = new Branch(this, action, init);
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

  private _engine?: DataEngineIF;
  get engine(): DataEngineIF {
    if (!this._engine) {
      this._engine = this.forest.dataEngine(this.dataEngine, this);
    }
    return this._engine;
  }
  get value() {
    return this.top.value;
  }
  do(name: ActionName, ...args: unknown[]): BranchIF {
    const action = this.engine.actions.get(name);
    if (!action)
      throw new Error(
        "engine " + this.dataEngine + " does not have an action " + name
      );
    let next = new Branch(this, action, args);
    join(this.top, next);
    return next;
  }
}
