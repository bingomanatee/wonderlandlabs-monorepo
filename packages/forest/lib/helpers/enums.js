"use strict";
// The reason a branch was added to a tree;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusEnum =
  exports.ChangeTypeEnumValues =
  exports.ChangeTypeEnum =
  exports.LeafValueEnum =
  exports.BranchActionEnum =
    void 0;
exports.BranchActionEnum = {
  init: Symbol("TREE_ACTION_INIT"),
  set: Symbol("TREE_ACTION_GET"),
  del: Symbol("TREE_ACTION_DEL"),
  change: Symbol("TREE_ACTION_CHANGE"),
  action: Symbol("TREE_ACTION_CHANGE"),
  trans: Symbol("TREE_ACTION_CHANGE"),
};
// possible "ittermittent" value of a request; i.e., why a value may not be returned (yet);
exports.LeafValueEnum = {
  absent: Symbol("LEAF_VALUE_ABSENT"),
  pending: Symbol("LEAF_VALUE_ABSENT"),
};
// The nature of an update;
exports.ChangeTypeEnum = {
  set: Symbol("BRANCH_CHANGE_SET"),
  del: Symbol("BRANCH_CHANGE_DEL"),
  change: Symbol("BRANCH_CHANGE_CHANGE"),
  sets: Symbol("BRANCH_CHANGE_SET"),
  changes: Symbol("BRANCH_CHANGE_CHANGE"),
  replace: Symbol("BRANCH_CHANGE_REPLACE"),
};
exports.ChangeTypeEnumValues = Array.from(
  Object.values(exports.ChangeTypeEnum),
);
// The nature of an update;
exports.StatusEnum = {
  good: Symbol("BRANCH_STATUS_GOOD"),
  bad: Symbol("BRANCH_STATUS_BAD"),
  pending: Symbol("BRANCH_STATUS_PENDING"),
};
