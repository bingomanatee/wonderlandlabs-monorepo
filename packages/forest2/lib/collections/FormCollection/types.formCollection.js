"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFieldIF = isFieldIF;
exports.isFieldList = isFieldList;
exports.isFieldValue = isFieldValue;
exports.isFieldRecord = isFieldRecord;
const types_guards_1 = require("../../types/types.guards");
function isFieldIF(a) {
    if (!(0, types_guards_1.isObj)(a)) {
        return false;
    }
    const o = a;
    if (!("name" in o &&
        "value" in o &&
        typeof o.name === "string" &&
        isFieldValue(o.value))) {
        return false;
    }
    return true;
}
function isFieldList(a) {
    return Array.isArray(a) && a.every(types_guards_1.isField);
}
function isFieldValue(a) {
    return typeof a == "string" || typeof a === "number";
}
function isFieldRecord(a) {
    if (!(0, types_guards_1.isObj)(a)) {
        return false;
    }
    const o = a;
    if (!Array.from(Object.values(o)).every(types_guards_1.isField)) {
        return false;
    }
    if (!Array.from(Object.keys(o)).every((k) => typeof k === "string")) {
        return false;
    }
    return true;
}
