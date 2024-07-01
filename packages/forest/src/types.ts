
export type TreeName = string;

// The reason a branch was added to a tree;
export const BranchActionEnum = {
    'set': Symbol('TREE_ACTION_GET'),
    'del': Symbol('TREE_ACTION_DEL'),
    'change': Symbol('TREE_ACTION_CHANGE'),
    'action': Symbol('TREE_ACTION_CHANGE'),
    'trans': Symbol('TREE_ACTION_CHANGE'),
}
type BranchActionEnumKeys = keyof typeof BranchActionEnum;
export type BranchAction = typeof BranchActionEnum[BranchActionEnumKeys];

// possible "ittermittent" value of a request; i.e., why a value may not be returned (yet);
export const LeafValueEnum = {
    'absent': Symbol('LEAF_VALUE_ABSENT'),
    'pending': Symbol('LEAF_VALUE_ABSENT')
}
type LeafValueEnumKeys = keyof typeof LeafValueEnum;
export type LeafValue<$V> = $V | typeof LeafValueEnum[LeafValueEnumKeys]

// The nature of an update;
export const BranchChangeTypeEnum = {
    'set': Symbol('BRANCH_CHANGE_SET'),
    'change': Symbol('BRANCH_CHANGE_CHANGE'),
    'sets': Symbol('BRANCH_CHANGE_SET'),
    'changes': Symbol('BRANCH_CHANGE_CHANGE'),
    'replace': Symbol('BRANCH_CHANGE_REPLACE')
}
type BranchChangeTypeEnumKeys = keyof typeof BranchChangeTypeEnum;
export type BranchChangeType = typeof BranchChangeTypeEnum[BranchChangeTypeEnumKeys]

const BranchTypeEnumValues: Symbol[] = Array.from(Object.values(BranchChangeTypeEnum));

export function isBranchChangeType(arg: unknown): arg is BranchChangeType {
    return typeof arg === 'symbol' && BranchTypeEnumValues.includes(arg);
}

// The nature of an update;
export const BranchStatusEnum = {
    'good': Symbol('BRANCH_STATUS_GOOD'),
    'bad': Symbol('BRANCH_STATUS_BAD'),
    'pending': Symbol('BRANCH_STATUS_PENDING'),
}
type BranchStausEnumKeys = keyof typeof BranchStatusEnum;
export type BranchStatus = typeof BranchStatusEnum[BranchStausEnumKeys]

export type LeafReq<$K> = {
    k: $K | $K[];
    t: TreeName; // the name of the Tree the leaf is from
}

// an identified element from a Tree. 
export type LeafIF<$K = unknown, $V = unknown> {
    v: LeafValue<$V>;
    k: $K;
    t: TreeName; // the name of the Tree the leaf is from
}
// the identity of a value; used to request values from Forests. 
export type LeafIdentityIF<$K = unknown, $V = unknown> {
    k: $K;
    t: TreeName; // the name of the Tree the leaf is from
}

// a Base is an item that can get or set values. it is a "map on steroids"
export interface Base<$K = unknown, $V = unknown> {
    get(key: $K): LeafIF<$K, $V>;
    has(key: $K): boolean;
    set(key: $K, value: $V): LeafIF<$K, $V>;
    async: boolean;
    t: TreeName;
    change(c: TreeChangeBase): TreeChangeResponse;
}

// one or more alterations to a sigle tree.
//  Sometimes the tree name is stored at a higher context. other times its defined in the change. 
export interface TreeChangeBase<$K = unknown, $V = unknown> {
    type: BranchChangeType;
    k?: $K | $K[];
    v?: $V;
    m?: Map<$K, $V>;
    t?: TreeName;
}

export interface TreeSet<$K = unknown, $V = unknown> extends TreeChangeBase<$K, $V> { 
    type: BranchChangeType = BranchChangeTypeEnum.set;
};

export interface TreeDel<$K = unknown, $V = unknown> extends TreeChangeBase<$K, $V> { }
export interface TreeSets<$K = unknown, $V = unknown> extends TreeChangeBase<$K, $V> { }
export interface TreeDels<$K = unknown, $V = unknown> extends TreeChangeBase<$K, $V> { }

export type TreeChange<$K = unknown, $V = unknown> = TreeSet<$K, $V> | TreeDel<$K, $V> | TreeSets<$K, $V> | TreeDels<$K, $V>

// a node on of a linked list that represents a change
export interface Branch<$K = unknown, $V = unknown> extends Base<$K, $V> {
    owner: TreeIF<$K, $V>;
    cause: BranchAction;
    status: BranchStatus;
    next?: Branch<$K, $V>;
    prev?: Branch<$K, $V>;
}

// a key/value collection
export interface TreeIF<$K = unknown, $V = unknown> extends Base<$K, $V> {
    root: Branch<$K, $V> | undefined;
    top: Base<$K, $V> | undefined;
}

// feedback from a change attempt
export interface TreeChangeResponse<$K = unknown, $V = unknown> {
    t: TreeName;
    status: BranchStatus;
    change: TreeChange<$K, $V>;
}

// a connection of Trees. 
export interface ForestIF {
    trees: Map<String, TreeIF>
    plantTree(t: TreeName, m: Map<unknown, unknown>, upsert?: boolean): TreeIF; // creates a new tree; throws if existing unless upsert is true. 
    // an existing tree ignores the second argument (map). 
    get(t: TreeName | LeafIdentityIF, key?: unknown): LeafIF
    set(change: TreeSet | TreeSet[]): TreeChangeResponse[];
    delete(tree: TreeName | LeafIF, keys?: unknown | unknown[]): TreeChangeResponse[];
    hasValue(t: TreeName, k: unknown): boolean;
    hasOne(r: LeafReq<unknown>): boolean;
    hasAll(r: LeafReq<unknown>[]): boolean;
    hasTree(t: TreeName): boolean;
    tree(t: TreeName): TreeIF | undefined;
}