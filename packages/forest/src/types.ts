export type DataEngineName = string;
export type TreeName = string;
export type ActionName = string;
export type GenObj = Record<string, unknown>;

export function isObj(a: unknown): a is object {
  return !!(a && typeof a === "object");
}

export type ActionMap = Map<ActionName, ActionIF>;

export type DataEngineValidatorFn = (data: unknown) => boolean;
export interface DataEngineIF {
  name: DataEngineName;
  validator?: DataEngineValidatorFn;
  actions: ActionMap;
}

export type KeyVal = { key: unknown; val: unknown };

export type TreeValidator = (tree: TreeIF) => void; // throws if invalid

export type TreeSeed = {
  val?: unknown;
  dataEngine: DataEngineName;
  validator?: TreeValidator;
};

export interface ActionIF {
  name: ActionName;
  cacheable?: boolean;
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
  cutMe(): BranchIF;
  destroy(): void;
  isTop: boolean;
  isRoot: boolean;
  data?: ActionDeltaArgs;
  isAlive: boolean;
}

export interface TreeIF {
  name: TreeName;
  root: BranchIF;
  top: BranchIF;
  readonly dataEngine: DataEngineName;
  readonly forest: ForestIF;
  readonly value: unknown;
  do(name: ActionName, ...args: ActionDeltaArgs): unknown;
  validate(): void;
  trim(id: number): BranchIF | undefined;
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

export type TransactFn = () => unknown;
export interface ForestIF {
  tree(name: TreeName, seed?: TreeSeed): TreeIF;
  nextID: number;
  dataEngine(
    nameOrEngine: DataEngineName | DataEngineIF | DataEngineFactory,
    tree?: TreeIF
  ): DataEngineIF;
  transact(fn: TransactFn ): unknown;
}
