import {
  LeafValue as RefValue,
  Change,
  Action,
  Status,
  DataType,
} from "./helpers/enums";
import { ScopeParams, AddTreeParams, BranchParams } from "./helpers/paramTypes";

export type TreeName = string;

// a "decorated" value from a tree
export type RefIF<$K = unknown, $V = unknown> = {
  val: RefValue<$V>;
  key: $K;
  treeName: TreeName; // the name of the Tree the leaf is from
  hasValue: boolean;
};
// the identity of a value; used to request values from Forests.
export type RefIdentityIF<$K = unknown> = {
  key: $K;
  treeName: TreeName; // the name of the Tree the leaf is from
};

export type GenObj = Record<string, unknown>;

// a Data is an item that can get or set values. it is a "map on steroids"'
// currently the base for Branch and Tree

export interface DataIF {
  ref(key: unknown): RefIF;
  get(key: unknown): unknown;
  has(key: unknown, local?: boolean): boolean;
  set(key: unknown, val: unknown): void;
  del(key: unknown): void;
  ref(key: unknown): RefIF;
  clear(): void; // removes all values in the table. (a "virtual removal" inside scopes)
}

/**
 * a "Leaf" is the part of a branch that deals with actual content.
 */
export interface LeafIF extends DataIF {
  branch: BranchIF;
  mergeInto(defaultVal: unknown): unknown; // returns a value updated with the values in this leaf.
  value: unknown;
  type: DataType;
  destroy(): void;
  keys: any[];
  deletedKeys: any[];
}
// a wrapper for any possible action to a tree.
export interface ChangeBase<$K = unknown, $V = unknown> {
  type: Change;
  key?: $K | $K[];
  val?: $V;
  data?: Map<$K, $V>;
  treeName: TreeName;
}

export interface ChangeSet<$K = unknown, $V = unknown>
  extends ChangeBase<$K, $V> {
  key: $K;
  val: $V;
}
export interface ChangeDel<$K = unknown, $V = unknown>
  extends ChangeBase<$K, $V> {
  key: $K;
}
export type ChangeSets<$K = unknown, $V = unknown> = ChangeBase<$K, $V>; // @TODO
export type ChangeDels<$K = unknown, $V = unknown> = ChangeBase<$K, $V>; // @TODO
//@TODO -- replace
export type TreeChange<$K = unknown, $V = unknown> =
  | ChangeSet<$K, $V>
  | ChangeDel<$K, $V>
  | ChangeSets<$K, $V>
  | ChangeDels<$K, $V>;

// feedback from a change attempt
export interface ChangeResponse<$K = unknown, $V = unknown> {
  treeName: TreeName;
  change: TreeChange<$K, $V>;
  status: Status;
}

// ------------ TOP LEVEL INTERFACES
/**
 * tranactions require a bundle of activity that are pending while their activity is in play.
 * When a transaction error is recieved, all sets that occured after the transaction are cancelled.
 */

export interface ScopeIF {
  readonly id: number;
  scopeID: string;
  name?: string;
  cause: Action;
  status: Status;
  async: boolean;
  inTrees: Set<TreeName>;
  error?: Error;
}

export type TreeData<$K = unknown, $V = unknown> =
  | Map<$K, $V>
  | Record<string, $V>;

export type IterFn = (val: unknown, key: unknown, stop: () => void) => void;

// a node on of a linked list that represents a change
export interface BranchIF {
  readonly id: number;
  readonly cause: Action;
  readonly causeID?: string;
  status: Status;

  tree: TreeIF;
  leaf: LeafIF;
  next?: BranchIF;
  prev?: BranchIF;

  // ---------- BRANCH OPERATIONS --------------

  pop(): void;
  prune(): void;
  push(branch: BranchIF): void;
  destroy(): void; // pops and destroys its leaf
}

// a key/value collection
export interface TreeIF extends DataIF {
  name: TreeName;
  root: BranchIF | undefined; // linked list start
  top: BranchIF | undefined; // linked list end
  forest: ForestIF;
  readonly dataType: DataType;
  status: Status;
  readonly branches: BranchIF[];
  count(stopAt?: number): number;
  readonly size: number; // the count of values in the tree -- INCLUDING DELETED VALUES.
  activeScopeCauseIDs: Set<string>;
  endScope(scopeID: string): void;
  pruneScope(scopeID: string): void;
  makeBranchData(tree: BranchIF, params: BranchParams): LeafIF;
  outerBranch(): BranchIF | undefined;
  makeBranch(params: BranchParams): BranchIF;
}

export type ScopeFn = (forest: ForestIF, ...args: any) => any;

// a connection of Trees.
export interface ForestIF {
  nextBranchId(): number;
  readonly cacheInterval: number;
  trees: Map<TreeName, TreeIF>;
  tree(t: TreeName): TreeIF | undefined;
  addTree(params: AddTreeParams): TreeIF; // creates a new tree; throws if existing unless upsert is true.
  // an existing tree ignores the second argument (map).
  get(treeNameOrLeaf: TreeName | RefIdentityIF, key?: unknown): RefIF;
  set(
    treeNameOrLeaf: TreeName | RefIF,
    key?: unknown,
    val?: unknown
  ): ChangeResponse;
  delete(tree: TreeName | RefIF, keys?: unknown | unknown[]): ChangeResponse;
  hasKey(t: TreeName, k: unknown): boolean;
  has(r: RefIdentityIF<unknown>): boolean;
  hasAll(r: RefIdentityIF<unknown>[]): boolean;
  hasTree(t: TreeName): boolean;
  currentScope?: ScopeIF;
  transact(fn: ScopeFn, params?: ScopeParams, ...args: never): unknown;
}
