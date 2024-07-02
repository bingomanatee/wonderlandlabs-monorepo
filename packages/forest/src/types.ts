import { LeafValue, ChangeType, BranchAction, Status } from "./enums";

export type TreeName = string;

export type LeafReq<$K> = {
    key: $K | $K[];
    treeName: TreeName; // the name of the Tree the leaf is from
}

// an identified element from a Tree. 
export type LeafIF<$K = unknown, $V = unknown> = {
    val: LeafValue<$V>;
    key: $K;
    treeName: TreeName; // the name of the Tree the leaf is from
    hasValue: boolean
}
// the identity of a value; used to request values from Forests. 
export type LeafIdentityIF<$K = unknown> = {
    key: $K;
    treeName: TreeName; // the name of the Tree the leaf is from
}

// a Base is an item that can get or set values. it is a "map on steroids"
export interface Base<$K = unknown, $V = unknown> {
    get(key: $K): LeafIF<$K, $V>;
    has(key: $K): boolean;
    set(key: $K, val: $V): LeafIF<$K, $V>;
    del(key: $K): LeafIF<$K, $V>;
    async: boolean;
    change(c: ChangeBase): ChangeResponse;
}

// one or more alterations to a sigle tree.
//  Sometimes the tree name is stored at a higher context. other times its defined in the change. 
export interface ChangeBase<$K = unknown, $V = unknown> {
    type: ChangeType;
    key?: $K | $K[];
    val?: $V;
    data?: Map<$K, $V>;
    treeName?: TreeName;
}

export interface ChangeSet<$K = unknown, $V = unknown> extends ChangeBase<$K, $V> { };
export interface ChangeDel<$K = unknown, $V = unknown> extends ChangeBase<$K, $V> { }
export interface ChangeSets<$K = unknown, $V = unknown> extends ChangeBase<$K, $V> { }
export interface ChangeDels<$K = unknown, $V = unknown> extends ChangeBase<$K, $V> { }

export type TreeChange<$K = unknown, $V = unknown> = ChangeSet<$K, $V> | ChangeDel<$K, $V> | ChangeSets<$K, $V> | ChangeDels<$K, $V>

// a node on of a linked list that represents a change
export interface BranchIF<$K = unknown, $V = unknown> extends Base<$K, $V> {
    tree: TreeIF<$K, $V>;
    cause: BranchAction;
    status: Status;
    next?: BranchIF<$K, $V>;
    prev?: BranchIF<$K, $V>;
}

export type BranchConfig = {
    data?: Map<unknown, unknown>,
    prev?: BranchIF,
    cause: BranchAction
}
// a key/value collection
export interface TreeIF<$K = unknown, $V = unknown> extends Base<$K, $V> {
    treeName: TreeName,
    root: BranchIF<$K, $V> | undefined; // linked list start
    top: Base<$K, $V> | undefined; // linked list end
    forest: ForestIF;
    status: Status
}

// feedback from a change attempt
export interface ChangeResponse<$K = unknown, $V = unknown> {
    treeName: TreeName;
    change: TreeChange<$K, $V>;
    status: Status;
}

// a connection of Trees. 
export interface ForestIF {
    trees: Map<String, TreeIF>
    addTree(params: TreeFactoryParams): TreeIF; // creates a new tree; throws if existing unless upsert is true. 
    // an existing tree ignores the second argument (map). 
    get(treeNameOrLeaf: TreeName | LeafIdentityIF, key?: unknown): LeafIF
    set(treeNameOrLeaf: TreeName | LeafIF, key?: unknown, val?: unknown): ChangeResponse;
    delete(tree: TreeName | LeafIF, keys?: unknown | unknown[]): ChangeResponse;
    hasKey(t: TreeName, k: unknown): boolean;
    has(r: LeafReq<unknown>): boolean;
    hasAll(r: LeafReq<unknown>[]): boolean;
    hasTree(t: TreeName): boolean;
    tree(t: TreeName): TreeIF | undefined;
}

export type LeafParams = {
    treeName: TreeName,
    key: unknown,
    val: unknown,
    forest?: ForestIF
}
export type TreeFactoryParams = {
    treeName: TreeName,
    data?: Map<unknown, unknown>,
    upsert?: boolean
}