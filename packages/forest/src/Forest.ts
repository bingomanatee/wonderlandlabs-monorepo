import { BehaviorSubject } from "rxjs";
import { Tree } from "./Tree";
import {
  ATIDs,
  EngineFactory,
  EngineIF,
  EngineName,
  TransactionErrorIF,
  EngineFactoryFn,
  ForestIF,
  isEngineFactory,
  isEngineIF,
  TransactFn,
  TreeIF,
  TreeName,
  TreeSeed,
} from "./types";
import { errorMessage } from "./helpers";
import { ValidatorError } from "./ValidatorError";

export type DataEngineFactoryOrEngine = EngineIF | EngineFactory;
type EngineArgs = EngineName | DataEngineFactoryOrEngine;

type DataEngineFn = (tree: TreeIF) => EngineIF;

function isDataEngineFn(a: unknown): a is DataEngineFn {
  return typeof a === "function";
}

export default class Forest implements ForestIF {
  constructor(engines: DataEngineFactoryOrEngine[]) {
    engines.forEach((e) => {
      if (isEngineFactory(e)) {
        this.engines.set(e.name, e.factory);
      } else if (isEngineIF(e)) {
        this.engines.set(e.name, e);
      } else {
        throw new Error("strange engine");
      }
    });
  }
  readonly errors: TransactionErrorIF[] = [];
  private trees: Map<TreeName, TreeIF> = new Map();
  private engines: Map<EngineName, EngineIF | EngineFactoryFn> = new Map();

  tree<ValueType, SeedType = TreeSeed>(
    name: TreeName,
    seed?: TreeSeed
  ): TreeIF {
    if (!seed) {
      if (!this.trees.has(name)) throw new Error("cannot find tree " + name);
      return this.trees.get(name)!;
    }
    if (this.trees.has(name)) throw new Error("cannot redefine tree " + name);
    const newTree = new Tree<ValueType>(this, name, seed);
    this.trees.set(name, newTree);
    return newTree;
  }
  engine(nameOrEngine: EngineArgs, tree?: TreeIF): EngineIF {
    if (typeof nameOrEngine === "string") {
      if (!this.engines.has(nameOrEngine)) {
        throw new Error("cannot find engine " + nameOrEngine);
      }
      let engine = this.engines.get(nameOrEngine)!;
      if (isDataEngineFn(engine)) {
        if (tree) return engine(tree);
        throw new Error("dataEngine(<string>, <tree>) requires a tree arg");
      }
      if (isEngineIF(engine)) {
        return engine;
      }
      throw new Error("strange engine for " + nameOrEngine);
    } else if (isEngineFactory(nameOrEngine)) {
      if (!tree) {
        throw new Error("dataEngine(<string>, <tree>) requires a tree arg");
      }
      return nameOrEngine.factory(tree);
    } else if (isEngineIF(nameOrEngine)) {
      this.engines.set(nameOrEngine.name, nameOrEngine);
      return nameOrEngine;
    } else {
      throw new Error("strange arg to dataEngine");
    }
  }

  private _nextID = 0;

  public get nextID() {
    this._nextID += 1;
    return this._nextID;
  }

  public activeTransactionIds = new BehaviorSubject<ATIDs>(new Set());

  private changeActiveTransactionIDs(delta: (s: ATIDs) => ATIDs | void) {
    const next = new Set(this.activeTransactionIds.value);
    let out = delta(next);

    this.activeTransactionIds.next(out || next);
  }

  public transact(fn: TransactFn) {
    const transId = this.nextID;
    this.changeActiveTransactionIDs((set: ATIDs) => {
      set.add(transId);
    });
    try {
      let out = fn(transId);
      this.changeActiveTransactionIDs((set) => {
        set.delete(transId);
      });
      return out;
    } catch (err) {
      const validator =
        err instanceof ValidatorError ? err.name : "transact error";
      const mutation =
        err instanceof ValidatorError ? err.mutation : "transact error";
      const errorId = this.nextID;
      this.errors.push({
        id: errorId,
        validator,
        mutation,
        message: errorMessage(err),
      });
      this.changeActiveTransactionIDs((set) => {
        set.delete(transId);
      });
      this.trees.forEach((tree) => tree.trim(transId, errorId));
      throw err;
    }
  }
}
