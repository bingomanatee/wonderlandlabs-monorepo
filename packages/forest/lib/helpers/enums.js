"use strict";
// The reason a branch was added to a tree;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Status_s = exports.ChangeTypeEnumValues = exports.Change_s = exports.LeafValue_s = exports.Aciion_s = void 0;
exports.Aciion_s = {
    init: Symbol("TREE_ACTION_INIT"),
    set: Symbol("TREE_ACTION_GET"),
    del: Symbol("TREE_ACTION_DEL"),
    change: Symbol("TREE_ACTION_CHANGE"),
    action: Symbol("TREE_ACTION_CHANGE"),
    trans: Symbol("TREE_ACTION_CHANGE"),
};
// possible "ittermittent" value of a request; i.e., why a value may not be returned (yet);
exports.LeafValue_s = {
    absent: Symbol("LEAF_VALUE_ABSENT"),
    pending: Symbol("LEAF_VALUE_ABSENT"),
};
// The nature of an update;
exports.Change_s = {
    set: Symbol("BRANCH_CHANGE_SET"),
    del: Symbol("BRANCH_CHANGE_DEL"),
    change: Symbol("BRANCH_CHANGE_CHANGE"),
    sets: Symbol("BRANCH_CHANGE_SET"),
    changes: Symbol("BRANCH_CHANGE_CHANGE"),
    replace: Symbol("BRANCH_CHANGE_REPLACE"),
};
exports.ChangeTypeEnumValues = Array.from(Object.values(exports.Change_s));
// The nature of an update;
exports.Status_s = {
    good: Symbol("BRANCH_STATUS_GOOD"),
    bad: Symbol("BRANCH_STATUS_BAD"),
    pending: Symbol("BRANCH_STATUS_PENDING"),
};
