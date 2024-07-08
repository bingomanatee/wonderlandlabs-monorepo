import { LeafValue, Change, Action, Status, DataType } from "./helpers/enums";
import { ScopeParams, AddTreeParams, BranchParams } from "./helpers/paramTypes";
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
export type GenObj = Record<string, unknown>;
export interface DataIF<$K = unknown, $V = unknown> {
    leaf(key: $K): LeafIF<$K, $V>;
    get(key: $K): LeafValue<$V>;
    has(key: $K, local?: boolean): boolean;
    set(key: $K, val: $V): void;
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
export type TreeData<$K = unknown, $V = unknown> = Map<$K, $V> | Record<string, $V>;
export type IterFn = (val: unknown, key: unknown, stop: () => void) => void;
export interface BranchIF extends DataIF {
    tree: TreeIF;
    readonly id: number;
    readonly cause: Action;
    readonly causeID?: string;
    status: Status;
    cache?: any;
    next?: BranchIF;
    prev?: BranchIF;
    mergeData(): any;
    ensureCurrentScope(): void;
    clearCache(ignoreScopes?: boolean): void;
    pop(): void;
    prune(): void;
    push(branch: BranchIF): void;
    destroy(): void;
    forEach(fn: IterFn): void;
}
export interface BranchMapIF<$K = unknown, $V = unknown> extends BranchIF {
    readonly data: Map<$K, $V>;
    values(list?: Map<$K, $V>): Map<$K, $V>;
    mergedData(): Map<$K, $V>;
    cache?: Map<$K, $V>;
    next$?: BranchMapIF<$K, $V>;
    prev$?: BranchMapIF<$K, $V>;
    make$(params: BranchParams): BranchMapIF<$K, $V>;
}
export interface BranchObjIF extends BranchIF {
    readonly data: GenObj;
    values(list?: GenObj): GenObj;
    mergedData$(): GenObj;
    cache?: GenObj;
    get(key: string): unknown;
    leaf$(key: string): LeafIF;
    next$?: BranchObjIF;
    prev$?: BranchObjIF;
    make$(params: BranchParams): BranchObjIF;
}
export interface TreeIF extends DataIF {
    name: TreeName;
    root: BranchIF | undefined;
    top: BranchIF | undefined;
    forest: ForestIF;
    readonly dataType: DataType;
    status: Status;
    readonly branches: BranchIF[];
    values(): TreeData;
    count(stopAt?: number): number;
    clearValues(): BranchIF[];
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
    addTree(params: AddTreeParams): TreeIF;
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
