// The reason a branch was added to a tree;

export const BranchActionEnum = {
    'init': Symbol('TREE_ACTION_INIT'),
    'set': Symbol('TREE_ACTION_GET'),
    'del': Symbol('TREE_ACTION_DEL'),
    'change': Symbol('TREE_ACTION_CHANGE'),
    'action': Symbol('TREE_ACTION_CHANGE'),
    'trans': Symbol('TREE_ACTION_CHANGE'),
};
type BranchActionEnumKeys = keyof typeof BranchActionEnum;
export type BranchAction = (typeof BranchActionEnum)[BranchActionEnumKeys];
// possible "ittermittent" value of a request; i.e., why a value may not be returned (yet);

export const LeafValueEnum = {
    'absent': Symbol('LEAF_VALUE_ABSENT'),
    'pending': Symbol('LEAF_VALUE_ABSENT')
};
type LeafValueEnumKeys = keyof typeof LeafValueEnum;
export type LeafValue<$V> = $V | (typeof LeafValueEnum)[LeafValueEnumKeys];
// The nature of an update;

export const ChangeTypeEnum = {
    'set': Symbol('BRANCH_CHANGE_SET'),
    'del': Symbol('BRANCH_CHANGE_DEL'),
    'change': Symbol('BRANCH_CHANGE_CHANGE'),
    'sets': Symbol('BRANCH_CHANGE_SET'),
    'changes': Symbol('BRANCH_CHANGE_CHANGE'),
    'replace': Symbol('BRANCH_CHANGE_REPLACE')
};
type ChangeTypeEnumKeys = keyof typeof ChangeTypeEnum;
export type ChangeType = (typeof ChangeTypeEnum)[ChangeTypeEnumKeys];
export const ChangeTypeEnumValues: Symbol[] = Array.from(Object.values(ChangeTypeEnum));

// The nature of an update;

export const StatusEnum = {
    'good': Symbol('BRANCH_STATUS_GOOD'),
    'bad': Symbol('BRANCH_STATUS_BAD'),
    'pending': Symbol('BRANCH_STATUS_PENDING'),
};
type StatusEnumKeys = keyof typeof StatusEnum;
export type Status = (typeof StatusEnum)[StatusEnumKeys];
