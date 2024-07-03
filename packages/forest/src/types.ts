import { LeafValue, ChangeType, BranchAction, Status } from "./enums";
import { TreeFactoryParams } from "./helpers/paramTypes";

export type TreeName = string;

// a "decorated" value from a tree
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

// a Data is an item that can get or set values. it is a "map on steroids"'
// currently the base for Branch and Tree

export interface Data<$K = unknown, $V = unknown> {
    // get and setLeaf are the same functionality as get and set,
    // but they return leaves instead of the raw value. 
    leaf(key: $K): LeafIF<$K, $V>;
    get(key: $K): LeafValue<$V>;
    has(key: $K): boolean;
    set(key: $K, val: $V): LeafValue<$V>;
    del(key: $K): void;
    change(change: TreeChange): ChangeResponse;
}

// a wrapper for any possible action to a tree. 
export interface ChangeBase<$K = unknown, $V = unknown> {
    type: ChangeType;
    key?: $K | $K[];
    val?: $V;
    data?: Map<$K, $V>;
    treeName: TreeName;
}

export interface ChangeSet<$K = unknown, $V = unknown> extends ChangeBase<$K, $V> { key: $K, val: $V };
export interface ChangeDel<$K = unknown, $V = unknown> extends ChangeBase<$K, $V> {key: $K }
export interface ChangeSets<$K = unknown, $V = unknown> extends ChangeBase<$K, $V> { }// @TODO
export interface ChangeDels<$K = unknown, $V = unknown> extends ChangeBase<$K, $V> { }// @TODO
//@TODO -- replace
export type TreeChange<$K = unknown, $V = unknown> = ChangeSet<$K, $V> | ChangeDel<$K, $V> | ChangeSets<$K, $V> | ChangeDels<$K, $V>

// a node on of a linked list that represents a change
export interface BranchIF<$K = unknown, $V = unknown> extends Data<$K, $V> {
    tree: TreeIF<$K, $V>;
    cause: BranchAction;
    status: Status;
    next?: BranchIF<$K, $V>;
    prev?: BranchIF<$K, $V>;
    data: Map<$K, $V>;
}

export type BranchConfig = {
    data?: Map<unknown, unknown>,
    prev?: BranchIF,
    cause: BranchAction
}
// a key/value collection
export interface TreeIF<$K = unknown, $V = unknown> extends Data<$K, $V> {
    name: TreeName,
    root: BranchIF<$K, $V> | undefined; // linked list start
    top: Data<$K, $V> | undefined; // linked list end
    forest: ForestIF;
    status: Status;
    readonly branches: BranchIF<$K, $V>[];
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
    has(r: LeafIdentityIF<unknown>): boolean;
    hasAll(r: LeafIdentityIF<unknown>[]): boolean;
    hasTree(t: TreeName): boolean;
    tree(t: TreeName): TreeIF | undefined;
}

