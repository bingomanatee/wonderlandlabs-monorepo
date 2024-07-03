import { LeafValue, ChangeType, BranchAction, Status } from "./enums";
import { TreeFactoryParams } from "./helpers/paramTypes";
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
    has(key: $K): boolean;
    set(key: $K, val: $V): LeafValue<$V>;
    del(key: $K): void;
    change(change: TreeChange): ChangeResponse;
}
export interface ChangeBase<$K = unknown, $V = unknown> {
    type: ChangeType;
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
export interface ChangeSets<$K = unknown, $V = unknown> extends ChangeBase<$K, $V> {
}
export interface ChangeDels<$K = unknown, $V = unknown> extends ChangeBase<$K, $V> {
}
export type TreeChange<$K = unknown, $V = unknown> = ChangeSet<$K, $V> | ChangeDel<$K, $V> | ChangeSets<$K, $V> | ChangeDels<$K, $V>;
export interface BranchIF<$K = unknown, $V = unknown> extends Data<$K, $V> {
    tree: TreeIF<$K, $V>;
    cause: BranchAction;
    status: Status;
    next?: BranchIF<$K, $V>;
    prev?: BranchIF<$K, $V>;
    data: Map<$K, $V>;
}
export type BranchConfig = {
    data?: Map<unknown, unknown>;
    prev?: BranchIF;
    cause: BranchAction;
};
export interface TreeIF<$K = unknown, $V = unknown> extends Data<$K, $V> {
    name: TreeName;
    root: BranchIF<$K, $V> | undefined;
    top: Data<$K, $V> | undefined;
    forest: ForestIF;
    status: Status;
    readonly branches: BranchIF<$K, $V>[];
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
    has(r: LeafIdentityIF<unknown>): boolean;
    hasAll(r: LeafIdentityIF<unknown>[]): boolean;
    hasTree(t: TreeName): boolean;
    tree(t: TreeName): TreeIF | undefined;
}
