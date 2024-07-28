import { A } from "@svgdotjs/svg.js";
import { ACTION_NAME_INITIALIZER } from "./constants";
import {
  MutatorArgs,
  MutatorIF,
  MutatorName,
  BranchIF,
  EngineIF,
  ForestIF,
  TreeIF,
  TreeName,
  TreeSeed,
  TransactFn,
  TreeValidator,
  Mutators,
  DiscardedBranchIF,
  MutationValidatorIF,
} from "./types";
import { Branch } from "./Branch";
import { join } from "./join";
import { errorMessage } from "./helpers";
import { ValidatorError } from "./ValidatorError";

const DEFAULT_INITIALIZER: MutatorIF = {
  name: "DEFAULT_INITIALIZER",
  mutator: function (_, args: MutatorArgs): unknown {
    return args[0];
  },
};

export class Tree implements TreeIF {
  constructor(public forest: ForestIF, public name: TreeName, seed: TreeSeed) {
    this.engineName = seed.engineName;
    const init = [seed.val];
    if (seed.validators) this.validators = seed.validators;
    const action = this.engine.actions.has(ACTION_NAME_INITIALIZER)
      ? this.engine.actions.get(ACTION_NAME_INITIALIZER)!
      : DEFAULT_INITIALIZER;
    this.root = new Branch(this, action, init);

    this.mut = this.makeMut();
    this.mutValidators = seed.mutatorValidators || [];
  }
  readonly trimmed: DiscardedBranchIF[] = [];
  private validators?: TreeValidator[];
  private mutValidators: MutationValidatorIF[];

  root: BranchIF;
  public get top(): BranchIF {
    let b = this.root;
    while (b) {
      if (!b.next) return b;
      b = b.next;
    }
    return b;
  }
  engineName: string;

  private _engine?: EngineIF;
  get engine(): EngineIF {
    if (!this._engine) {
      this._engine = this.forest.engine(this.engineName, this);
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
    this.validators?.forEach((val) => {
      try {
        val(this);
      } catch (err) {
        throw new ValidatorError(err, val);
      }
    });
  }

  mutate(name: MutatorName, ...input: unknown[]) {
    // mutation validators validate input - so they execute before a new branch is created. 
    this.mutValidators.forEach((val: MutationValidatorIF) => {
      try {
        if (val.onlyFor) {
          if (typeof val.onlyFor === "string" && name !== name) {
            return;
          }
          if (Array.isArray(val.onlyFor)) {
            if (val.onlyFor.indexOf(name) === -1) {
              return;
            }
          }
        }
        val.validator(input, this, name);
      } catch (err) {
        this.forest.errors.push({
          message: errorMessage(err),
          id: this.forest.nextID,
          mutation: name,
          validator: val.name,
        });
        throw new ValidatorError(err, val, name);
      }
    });

    if (!this.engine.actions.has(name)) {
      throw new Error(
        "engine " + this.engineName + " does not have an action " + name
      );
    }
    const action = this.engine.actions.get(name)!;

    return this.forest.transact(() => {
      let next: BranchIF = new Branch(this, action, input);
      join(this.top, next);
      try {
        this.validate();
      } catch (err) {
        if (err instanceof ValidatorError) {
          err.mutation = name;
        }
        throw err;
      }
      return this.value;
    });
  }

  public readonly mut: Mutators = {};
  private makeMut() {
    let newActs: Mutators = {};

    this.engine.actions.forEach((action, name) => {
      newActs[name] = (...args: MutatorArgs) => this.mutate(name, ...args);
    });
    return newActs;
  }

  trim(id: number, errorId: number) {
    if (this.top.id < id) return undefined;
    let last = this.top;
    while (last.id > id) {
      if (!last.prev) {
        last.cutMe(errorId);
        // a branchless tree - should not happen.
        return last;
      }
      if (last.prev.id < id) {
        last.cutMe(errorId);
        return last;
      }
      last = this.top;
    }
  }
}
