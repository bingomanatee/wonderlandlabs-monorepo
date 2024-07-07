"use strict";
// The reason a branch was added to a tree;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataType_s = exports.Status_s = exports.ChangeTypeEnumValues = exports.Change_s = exports.LeafValue_s = exports.Action_s = void 0;
exports.Action_s = {
    init: Symbol("ACTION_INIT"),
    set: Symbol("ACTION_SET"),
    del: Symbol("ACTION_DEL"),
    change: Symbol("ACTION_CHANGE"),
    action: Symbol("ACTION_CHANGE"),
    trans: Symbol("ACTION_CHANGE"),
    clear: Symbol("ACTION_CLEAR"),
};
// possible "ittermittent" value of a request; i.e., why a value may not be returned (yet);
exports.LeafValue_s = {
    absent: Symbol("LEAF_VALUE_ABSENT"),
    pending: Symbol("LEAF_VALUE_ABSENT"),
};
// The nature of an update;
exports.Change_s = {
    set: Symbol("CHANGE_SET"),
    del: Symbol("CHANGE_DEL"),
    change: Symbol("CHANGE_CHANGE"),
    sets: Symbol("CHANGE_SET"),
    changes: Symbol("CHANGE_CHANGE"),
    replace: Symbol("CHANGE_REPLACE"),
};
exports.ChangeTypeEnumValues = Array.from(Object.values(exports.Change_s));
// The nature of an update;
exports.Status_s = {
    good: Symbol("BRANCH_STATUS_GOOD"),
    bad: Symbol("BRANCH_STATUS_BAD"),
    pending: Symbol("BRANCH_STATUS_PENDING"),
};
// The nature of an update;
exports.DataType_s = {
    map: Symbol("DATA_TYPE_MAP"),
    object: Symbol('DATA_TYPE_OBJECT')
};
