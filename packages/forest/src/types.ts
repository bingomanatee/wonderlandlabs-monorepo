export type EngineName = string;
export type TreeName = string;
export type MutatorName = string;
export type GenObj = Record<string, unknown>;
export type MapSrc<k = unknown, v = unknown> = [k, v][];

export function isObj(a: unknown): a is object {
  return !!(a && typeof a === "object");
}

export type MutatorMap<ValueType> = Map<MutatorName, MutatorIF<ValueType>>;

export function isDataEngineValidatorFn(
  data: unknown
): data is EngineValidatorFn {
  return typeof data === "function";
}
export type EngineValidatorFn = (data: unknown, tree: TreeIF) => boolean | void;
export function isEngineIF(a: unknown): a is EngineIF {
  if (!(isObj(a) && "name" in a && a.name && typeof a.name === "string")) {
    return false;
  }
  if (!(!("validator" in a) || isDataEngineValidatorFn(a.validator))) {
    return false;
  }
  return true;
}

export interface EngineIF<ValueType> {
  name: EngineName;
  actions: MutatorMap<ValueType>;
  validator?: EngineValidatorFn;
}

export type MutationValidatorFn = (
  input: unknown[],
  tree: TreeIF,
  name: string
) => void;

export interface MutationValidatorIF {
  name: string;
  onlyFor?: string | string[]; // if unset will be triggered before all actions;
  validator: MutationValidatorFn;
}

export type KeyVal = { key: unknown; val: unknown };

export type TreeValidator = (tree: TreeIF) => false | void; // throws if invalid

export type TreeSeed<ValueType = unknown> = {
  val?: ValueType;
  engineName: EngineName;
  engineInput?: unknown;
  validators?: TreeValidator[];
  mutatorValidators?: MutationValidatorIF[];
};

export type Cacheable = boolean | symbol;
export interface MutatorIF<ValueType> {
  name: MutatorName;
  cacheable?: Cacheable;
  get(branch: BranchIF<ValueType>, ...args: MutatorArgs): ValueType; // how to derive a value for a given $branch
}

export type MutatorArgs = unknown[];
export interface BranchIF<ValueType = unknown> {
  readonly value: ValueType;
  id: number;
  prev?: BranchIF;
  next?: BranchIF;
  tree: TreeIF;
  mutator: MutatorIF<ValueType>;
  push(branch: BranchIF<ValueType>): void;
  popMe(): BranchIF<ValueType>;
  cutMe(errorId: number): BranchIF<ValueType>;
  destroy(): void;
  isTop: boolean;
  isRoot: boolean;
  input?: MutatorArgs;
  isAlive: boolean;
  clearPrevCache(clear?: boolean): void;
  isCached: boolean;
}

export interface DiscardedBranchIF {
  id: number;
  mutator: string;
  data?: MutatorArgs;
  errorId: number;
}

export interface TransactionErrorIF {
  id: number;
  message: string;
  mutation?: string;
  validator?: string;
}

export type MutatorFn = (...args: MutatorArgs) => unknown;
export type Mutators = Record<string, MutatorFn>;
export type TreeIF<ValueType = unknown> {
  name: TreeName;
  root: BranchIF<ValueType>;
  top: BranchIF<ValueType>;
  mut: Mutators;
  readonly engineName: EngineName;
  readonly forest: ForestIF;
  readonly value: unknown;
  readonly engineInput?: unknown;
  mutate(name: MutatorName, ...args: MutatorArgs): void;
  validate(): void;
  trim(id: number, errorId: number): BranchIF | undefined;
  trimmed: DiscardedBranchIF[];
}

export function isTreeIF(a: unknown): a is TreeIF {
  if (!isObj(a)) return false;
  const o = a as GenObj;
  if (!["name", "root", "top", "mut", "engineName"].every((key) => key in o)) {
    return false;
  }
  return true;
}

export type GenFun = () => unknown;

export type EngineFactoryFn = (tree: TreeIF) => EngineIF;

export type EngineFactory = {
  name: string;
  factory: EngineFactoryFn;
};

export function isEngineFactory(a: unknown): a is EngineFactory {
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
  tree<ValueType>(
    name: TreeName,
    seed?: TreeSeed
  ): TreeIF<ValueType>;
  nextID: number;
  engine<ValueType>(
    nameOrEngine: EngineName | EngineIF | EngineFactory,
    tree?: TreeIF<ValueType>
  ): EngineIF;
  transact(fn: TransactFn): unknown;
  errors: TransactionErrorIF[];
}

export type ATIDs = Set<number>;
export type MutationFactcory = (engine: EngineIF) => MutatorIF;
