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
  TransactFn,
  TreeValidator,
  Acts,
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
    if (seed.validator) this.validator = seed.validator;
    const action = this.engine.actions.has(ACTION_NAME_INITIALIZER)
      ? this.engine.actions.get(ACTION_NAME_INITIALIZER)!
      : DEFAULT_INITIALIZER;
    this.root = new Branch(this, action, init);

    this.acts = this.initActs();
  }
  private validator?: TreeValidator;
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

  public validate() {
    if (this.engine.validator) {
        this.engine.validator(this.value, this);
    }
    if (this.validator) {
      this.validator(this);
    }
  }

  do(name: ActionName, ...args: unknown[]) {
    const action = this.engine.actions.get(name);
    return this.forest.transact(() => {
      if (!action)
        throw new Error(
          "engine " + this.dataEngine + " does not have an action " + name
        );
      let next: BranchIF = new Branch(this, action, args);
      join(this.top, next);
      this.validate();
      return next.value;
    });
  }

  public readonly acts: Acts = {};
  private initActs() {
    let newActs: Acts = {};

    this.engine.actions.forEach((action, name) => {
      newActs[name] = (...args: ActionDeltaArgs) => this.do(name, ...args);
    });
    return newActs;
  }

  trim(id: number) {
    if (this.top.id < id) return undefined;
    let last = this.top;
    while (last.id > id) {
      if (!last.prev) {
        last.cutMe();
        // a branchless tree - should not happen.
        return last;
      }
      if (last.prev.id < id) {
        last.cutMe();
        return last;
      }
      last = last.prev;
    }
  }
}
