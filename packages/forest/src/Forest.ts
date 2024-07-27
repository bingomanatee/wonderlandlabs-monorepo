import { BehaviorSubject } from "rxjs";
import { Tree } from "./Tree";
import {
  ATIDs,
  DataEngineFactory,
  DataEngineIF,
  DataEngineName,
  DoErrorIF,
  EngineFactory,
  ForestIF,
  isDataEngineFactory,
  isDataEngineIF,
  TransactFn,
  TreeIF,
  TreeName,
  TreeSeed,
} from "./types";

export type DataEngineFactoryOrEngine = DataEngineIF | DataEngineFactory;
type EngineArgs = DataEngineName | DataEngineFactoryOrEngine;

type DataEngineFn = (tree: TreeIF) => DataEngineIF;

function isDataEngineFn(a: unknown): a is DataEngineFn {
  return typeof a === "function";
}

function errorMessage(err: unknown){ 
  if (err instanceof Error) {
    return err.message;
  }
  if (typeof err === 'string') {
    return err;
  }
  return '-- unknown error --';
}

export default class Forest implements ForestIF {
  constructor(engines: DataEngineFactoryOrEngine[]) {
    engines.forEach((e) => {
      if (isDataEngineFactory(e)) {
        this.engines.set(e.name, e.factory);
      } else if (isDataEngineIF(e)) {
        this.engines.set(e.name, e);
      } else {
        throw new Error("strange engine");
      }
    });
  }
  readonly errors: DoErrorIF[] = [];
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
      if (isDataEngineFn(engine)) {
        if (tree) return engine(tree);
        throw new Error("dataEngine(<string>, <tree>) requires a tree arg");
      }
      if (isDataEngineIF(engine)) {
        return engine;
      }
      throw new Error("strange engine for " + nameOrEngine);
    } else if (isDataEngineFactory(nameOrEngine)) {
      if (!tree) {
        throw new Error("dataEngine(<string>, <tree>) requires a tree arg");
      }
      return nameOrEngine.factory(tree);
    } else if (isDataEngineIF(nameOrEngine)) {
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
      const errorId = this.nextID;
      const message = errorMessage(err);
      this.errors.push({id: errorId, message});
      this.changeActiveTransactionIDs((set) => {
        set.delete(transId);
      });
      this.trees.forEach((tree) => tree.trim(transId, errorId));
      throw err;
    }
  }
}
