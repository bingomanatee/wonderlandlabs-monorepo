export type DataEngineName = string;
export type TreeName = string;
export type ActionName = string;
export type GenObj = Record<string, unknown>;

export function isObj(a: unknown): a is object {
  return !!(a && typeof a === "object");
}

export type ActionMap = Map<ActionName, ActionIF>;

export function isDataEngineValidatorFn(
  data: unknown
): data is DataEngineValidatorFn {
  return typeof data === "function";
}
export type DataEngineValidatorFn = (data: unknown, tree: TreeIF) => boolean;
export function isDataEngineIF(a: unknown): a is DataEngineIF {
  if (!(isObj(a) && "name" in a && a.name && typeof a.name === "string")) {
    return false;
  }
  if (!(!("validator" in a) || isDataEngineValidatorFn(a.validator))) {
    return false;
  }
  return true;
}

export interface DataEngineIF {
  name: DataEngineName;
  actions: ActionMap;
  validator?: DataEngineValidatorFn;
}

export type KeyVal = { key: unknown; val: unknown };

export type TreeValidator = (tree: TreeIF) => void; // throws if invalid

export type TreeSeed = {
  val?: unknown;
  dataEngine: DataEngineName;
  validator?: TreeValidator;
};

export type Cacheable = boolean | symbol;
export interface ActionIF {
  name: ActionName;
  cacheable?: Cacheable;
  delta(branch: BranchIF, ...args: ActionDeltaArgs): unknown; // how to derive a value for a given branch
}

export type ActionDeltaArgs = unknown[];
export interface BranchIF {
  readonly value: unknown;
  id: number;
  prev?: BranchIF;
  next?: BranchIF;
  tree: TreeIF;
  action: ActionIF;
  push(branch: BranchIF): void;
  popMe(): BranchIF;
  cutMe(errorId: number): BranchIF;
  destroy(): void;
  isTop: boolean;
  isRoot: boolean;
  data?: ActionDeltaArgs;
  isAlive: boolean;
  clearPrevCache(clear?: boolean): void;
  isCached: boolean;
}

export interface DiscardedBranchIF {
  id: number;
  action: string;
  data?: ActionDeltaArgs;
  errorId: number;
}

export interface DoErrorIF {
  id: number;
  message: string;
}

export type ActFn = (...args: ActionDeltaArgs) => unknown;
export type Acts = Record<string, ActFn>;
export interface TreeIF {
  name: TreeName;
  root: BranchIF;
  top: BranchIF;
  acts: Acts;
  readonly dataEngine: DataEngineName;
  readonly forest: ForestIF;
  readonly value: unknown;
  do(name: ActionName, ...args: ActionDeltaArgs): unknown;
  validate(): void;
  trim(id: number, errorId: number): BranchIF | undefined;
  trimmed: DiscardedBranchIF[]
}

export type EngineFactory = (tree: TreeIF) => DataEngineIF;

export type DataEngineFactory = {
  name: string;
  factory: EngineFactory;
};

export function isDataEngineFactory(a: unknown): a is DataEngineFactory {
  if (!isObj(a)) return false;
  return (
    "name" in a &&
    "factory" in a &&
    typeof a.name === "string" &&
    typeof a.factory === "function"
  );
}

export type TransactFn = (transId: number) => unknown;
export interface ForestIF {
  tree(name: TreeName, seed?: TreeSeed): TreeIF;
  nextID: number;
  dataEngine(
    nameOrEngine: DataEngineName | DataEngineIF | DataEngineFactory,
    tree?: TreeIF
  ): DataEngineIF;
  transact(fn: TransactFn): unknown;
  errors: DoErrorIF[];
}

export type ATIDs = Set<number>;
export type ActionFactory = (engine: DataEngineIF) => ActionIF;
