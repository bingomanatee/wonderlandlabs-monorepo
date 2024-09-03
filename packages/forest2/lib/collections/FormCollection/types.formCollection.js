"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFieldValue = isFieldValue;
exports.isFieldIF = isFieldIF;
exports.isObj = isObj;
exports.isField = isField;
exports.isFieldList = isFieldList;
exports.isFieldRecord = isFieldRecord;
function isFieldValue(a) {
    return typeof a == "string" || typeof a === "number";
}
function isFieldIF(a) {
    if (!isObj(a)) {
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
function isObj(a) {
    return Boolean(a && typeof a === "object");
}
function isField(a) {
    if (!isObj(a)) {
        return false;
    }
    const o = a;
    return Boolean("name" in o &&
        "value" in o &&
        typeof o.name === "string" &&
        (typeof o.value === "number" || typeof o.value === "string"));
}
function isFieldList(a) {
    return Array.isArray(a) && a.every(isField);
}
function isFieldRecord(a) {
    if (!isObj(a)) {
        return false;
    }
    const o = a;
    if (!Array.from(Object.values(o)).every(isField)) {
        return false;
    }
    if (!Array.from(Object.keys(o)).every((k) => typeof k === "string")) {
        return false;
    }
    return true;
}
