import type {
  ForestIF,
  LeafIF,
  LeafIdentityIF,
  TreeIF,
  TreeName,
  ChangeResponse,
  ScopeIF,
  ScopeFn,
} from "./types";
import type {
  ForestParams,
  ScopeParams,
  TreeFactoryParams,
} from "./helpers/paramTypes";
export declare class Forest implements ForestIF {
  constructor(params?: ForestParams);
  readonly cacheInterval: number;
  private _nextBranchId;
  nextBranchId(): number;
  trees: Map<string, TreeIF>;
  addTree(params: TreeFactoryParams): TreeIF;
  delete(treeName: TreeName | LeafIF, key?: unknown): ChangeResponse;
  get(treeNameOrLeaf: TreeName | LeafIdentityIF, key?: unknown): LeafIF;
  set(
    treeNameOrLeaf: TreeName | LeafIF,
    key?: unknown,
    val?: unknown,
  ): ChangeResponse;
  private change;
  hasKey(treeName: TreeName, k: unknown): boolean;
  has(r: LeafIdentityIF<unknown>): boolean;
  hasAll(r: LeafIdentityIF<unknown>[]): boolean;
  hasTree(treeName: TreeName): boolean;
  tree(treeName: TreeName): TreeIF | undefined;
  private scopes;
  private pruneScope;
  get currentScope(): ScopeIF;
  completedScopes: ScopeIF[];
  maxCompletedScopes: number;
  private archiveScope;
  transact(fn: ScopeFn, params?: ScopeParams, ...args: never[]): any;
}
