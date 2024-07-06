import { LeafValue, Change, Action, Status } from "./helpers/enums";
import { ScopeParams, TreeFactoryParams } from "./helpers/paramTypes";
export type TreeName = string;
export type LeafIF<$K = unknown, $V = unknown> = {
    val: LeafValue<$V>;
    key: $K;
    treeName: TreeName;
    hasValue: boolean;
};
export type LeafIdentityIF<$K = unknown> = {
    key: $K;
    treeName: TreeName;
};
export interface Data<$K = unknown, $V = unknown> {
    leaf(key: $K): LeafIF<$K, $V>;
    get(key: $K): LeafValue<$V>;
    has(key: $K, local?: boolean): boolean;
    set(key: $K, val: $V): LeafValue<$V>;
    del(key: $K): void;
    change(change: TreeChange): ChangeResponse;
}
export interface ChangeBase<$K = unknown, $V = unknown> {
    type: Change;
    key?: $K | $K[];
    val?: $V;
    data?: Map<$K, $V>;
    treeName: TreeName;
}
export interface ChangeSet<$K = unknown, $V = unknown> extends ChangeBase<$K, $V> {
    key: $K;
    val: $V;
}
export interface ChangeDel<$K = unknown, $V = unknown> extends ChangeBase<$K, $V> {
    key: $K;
}
export type ChangeSets<$K = unknown, $V = unknown> = ChangeBase<$K, $V>;
export type ChangeDels<$K = unknown, $V = unknown> = ChangeBase<$K, $V>;
export type TreeChange<$K = unknown, $V = unknown> = ChangeSet<$K, $V> | ChangeDel<$K, $V> | ChangeSets<$K, $V> | ChangeDels<$K, $V>;
export interface ChangeResponse<$K = unknown, $V = unknown> {
    treeName: TreeName;
    change: TreeChange<$K, $V>;
    status: Status;
}
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
export interface BranchIF<$K = unknown, $V = unknown> extends Data<$K, $V> {
    tree: TreeIF<$K, $V>;
    readonly id: number;
    readonly cause: Action;
    readonly causeID?: string;
    status: Status;
    readonly data: Map<$K, $V>;
    values(list?: Map<$K, $V>): Map<$K, $V>;
    next?: BranchIF<$K, $V>;
    prev?: BranchIF<$K, $V>;
    cache?: Map<$K, $V>;
    mergedData(): Map<$K, $V>;
    ensureCurrentScope(): void;
    clearCache(ignoreScopes?: boolean): void;
    pop(): void;
    prune(): void;
    destroy(): void;
}
export interface TreeIF<$K = unknown, $V = unknown> extends Data<$K, $V> {
    name: TreeName;
    root: BranchIF<$K, $V> | undefined;
    top: BranchIF<$K, $V> | undefined;
    forest: ForestIF;
    status: Status;
    readonly branches: BranchIF<$K, $V>[];
    values(): Map<$K, $V>;
    count(stopAt?: number): number;
    clearValues(): BranchIF<$K, $V>[];
    readonly size: number;
    activeScopeCauseIDs: Set<string>;
    endScope(scopeID: string): void;
    pruneScope(scopeID: string): void;
}
export type ScopeFn = (forest: ForestIF, ...args: any) => any;
export interface ForestIF {
    nextBranchId(): number;
    readonly cacheInterval: number;
    trees: Map<TreeName, TreeIF>;
    tree(t: TreeName): TreeIF | undefined;
    addTree(params: TreeFactoryParams): TreeIF;
    get(treeNameOrLeaf: TreeName | LeafIdentityIF, key?: unknown): LeafIF;
    set(treeNameOrLeaf: TreeName | LeafIF, key?: unknown, val?: unknown): ChangeResponse;
    delete(tree: TreeName | LeafIF, keys?: unknown | unknown[]): ChangeResponse;
    hasKey(t: TreeName, k: unknown): boolean;
    has(r: LeafIdentityIF<unknown>): boolean;
    hasAll(r: LeafIdentityIF<unknown>[]): boolean;
    hasTree(t: TreeName): boolean;
    currentScope?: ScopeIF;
    transact(fn: ScopeFn, params?: ScopeParams, ...args: never): unknown;
}
