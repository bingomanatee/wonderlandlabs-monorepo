// The reason a branch was added to a tree;

export const Action_s = {
  init: Symbol("ACTION_INIT"),
  set: Symbol("ACTION_SET"),
  del: Symbol("ACTION_DEL"),
  change: Symbol("ACTION_CHANGE"),
  action: Symbol("ACTION_CHANGE"),
  trans: Symbol("ACTION_CHANGE"),
  clear: Symbol("ACTION_CLEAR"),
};
type ActionEnumKeys = keyof typeof Action_s;
export type Action = typeof Action_s[ActionEnumKeys];
// possible "ittermittent" value of a request; i.e., why a value may not be returned (yet);

export const LeafValue_s = {
  absent: Symbol("LEAF_VALUE_ABSENT"),
  pending: Symbol("LEAF_VALUE_ABSENT"),
};
type LeafValueEnumKeys = keyof typeof LeafValue_s;
export type LeafValue<$V> = $V | typeof LeafValue_s[LeafValueEnumKeys];
// The nature of an update;

export const Change_s = {
  set: Symbol("CHANGE_SET"),
  del: Symbol("CHANGE_DEL"),
  change: Symbol("CHANGE_CHANGE"),
  sets: Symbol("CHANGE_SET"),
  changes: Symbol("CHANGE_CHANGE"),
  replace: Symbol("CHANGE_REPLACE"),
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

// The nature of an update;

export const DataType_s = {
  map: Symbol("DATA_TYPE_MAP"),
  object: Symbol('DATA_TYPE_OBJECT')
};
type DataTypeKeys = keyof typeof DataType_s;
export type DataType = typeof DataType_s[DataTypeKeys];
