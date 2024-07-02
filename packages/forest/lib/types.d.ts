import { LeafValue, ChangeType, BranchAction, Status } from "./enums";
export type TreeName = string;
export type LeafReq<$K> = {
    key: $K | $K[];
    treeName: TreeName;
};
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
export interface Base<$K = unknown, $V = unknown> {
    get(key: $K): LeafIF<$K, $V>;
    has(key: $K): boolean;
    set(key: $K, val: $V): LeafIF<$K, $V>;
    del(key: $K): LeafIF<$K, $V>;
    async: boolean;
    change(c: ChangeBase): ChangeResponse;
}
export interface ChangeBase<$K = unknown, $V = unknown> {
    type: ChangeType;
    key?: $K | $K[];
    val?: $V;
    data?: Map<$K, $V>;
    treeName?: TreeName;
}
export interface ChangeSet<$K = unknown, $V = unknown> extends ChangeBase<$K, $V> {
}
export interface ChangeDel<$K = unknown, $V = unknown> extends ChangeBase<$K, $V> {
}
export interface ChangeSets<$K = unknown, $V = unknown> extends ChangeBase<$K, $V> {
}
export interface ChangeDels<$K = unknown, $V = unknown> extends ChangeBase<$K, $V> {
}
export type TreeChange<$K = unknown, $V = unknown> = ChangeSet<$K, $V> | ChangeDel<$K, $V> | ChangeSets<$K, $V> | ChangeDels<$K, $V>;
export interface BranchIF<$K = unknown, $V = unknown> extends Base<$K, $V> {
    tree: TreeIF<$K, $V>;
    cause: BranchAction;
    status: Status;
    next?: BranchIF<$K, $V>;
    prev?: BranchIF<$K, $V>;
}
export type BranchConfig = {
    data?: Map<unknown, unknown>;
    prev?: BranchIF;
    cause: BranchAction;
};
export interface TreeIF<$K = unknown, $V = unknown> extends Base<$K, $V> {
    treeName: TreeName;
    root: BranchIF<$K, $V> | undefined;
    top: Base<$K, $V> | undefined;
    forest: ForestIF;
    status: Status;
}
export interface ChangeResponse<$K = unknown, $V = unknown> {
    treeName: TreeName;
    change: TreeChange<$K, $V>;
    status: Status;
}
export interface ForestIF {
    trees: Map<String, TreeIF>;
    addTree(params: TreeFactoryParams): TreeIF;
    get(treeNameOrLeaf: TreeName | LeafIdentityIF, key?: unknown): LeafIF;
    set(treeNameOrLeaf: TreeName | LeafIF, key?: unknown, val?: unknown): ChangeResponse;
    delete(tree: TreeName | LeafIF, keys?: unknown | unknown[]): ChangeResponse;
    hasKey(t: TreeName, k: unknown): boolean;
    has(r: LeafReq<unknown>): boolean;
    hasAll(r: LeafReq<unknown>[]): boolean;
    hasTree(t: TreeName): boolean;
    tree(t: TreeName): TreeIF | undefined;
}
export type LeafParams = {
    treeName: TreeName;
    key: unknown;
    val: unknown;
    forest?: ForestIF;
};
export type TreeFactoryParams = {
    treeName: TreeName;
    data?: Map<unknown, unknown>;
    upsert?: boolean;
};
