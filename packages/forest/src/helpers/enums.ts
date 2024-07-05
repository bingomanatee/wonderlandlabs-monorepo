// The reason a branch was added to a tree;

export const Aciion_s = {
  init: Symbol("TREE_ACTION_INIT"),
  set: Symbol("TREE_ACTION_GET"),
  del: Symbol("TREE_ACTION_DEL"),
  change: Symbol("TREE_ACTION_CHANGE"),
  action: Symbol("TREE_ACTION_CHANGE"),
  trans: Symbol("TREE_ACTION_CHANGE"),
};
type ActionEnumKeys = keyof typeof Aciion_s;
export type Action = typeof Aciion_s[ActionEnumKeys];
// possible "ittermittent" value of a request; i.e., why a value may not be returned (yet);

export const LeafValue_s = {
  absent: Symbol("LEAF_VALUE_ABSENT"),
  pending: Symbol("LEAF_VALUE_ABSENT"),
};
type LeafValueEnumKeys = keyof typeof LeafValue_s;
export type LeafValue<$V> = $V | typeof LeafValue_s[LeafValueEnumKeys];
// The nature of an update;

export const Change_s = {
  set: Symbol("BRANCH_CHANGE_SET"),
  del: Symbol("BRANCH_CHANGE_DEL"),
  change: Symbol("BRANCH_CHANGE_CHANGE"),
  sets: Symbol("BRANCH_CHANGE_SET"),
  changes: Symbol("BRANCH_CHANGE_CHANGE"),
  replace: Symbol("BRANCH_CHANGE_REPLACE"),
};
type ChangeKeys = keyof typeof Change_s;
export type Change = typeof Change_s[ChangeKeys];
export const ChangeTypeEnumValues: symbol[] = Array.from(
  Object.values(Change_s)
);

// The nature of an update;

export const Status_s = {
  good: Symbol("BRANCH_STATUS_GOOD"),
  bad: Symbol("BRANCH_STATUS_BAD"),
  pending: Symbol("BRANCH_STATUS_PENDING"),
};
type StatusKeys = keyof typeof Status_s;
export type Status = typeof Status_s[StatusKeys];
