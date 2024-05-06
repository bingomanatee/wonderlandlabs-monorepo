"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isForestChange = exports.isTableChangeField = exports.isTableChangeBase = exports.isObj = void 0;
const walrus_1 = require("@wonderlandlabs/walrus");
function isObj(x) {
    return walrus_1.type.describe(x, true) === walrus_1.TypeEnum.object;
}
exports.isObj = isObj;
/**
 * tests for "general case" TableChange = TableChangeField | TableChangeMultiField | TableChangeValue
 * @param x
 */
function isTableChangeBase(x) {
    if (!isObj(x)) {
        return false;
    }
    if (!('table' in x || 'action' in x)) {
        return false;
    }
    //@TODO: test action
    if (!x.table || typeof x.table !== 'string') {
        return false;
    }
    return true;
}
exports.isTableChangeBase = isTableChangeBase;
function isTableChangeField(x) {
    if (!isTableChangeBase(x)) {
        return false;
    }
    if (!('id' in x && 'field' in x && 'value' in x)) {
        return false;
    }
    return true;
}
exports.isTableChangeField = isTableChangeField;
function isForestChange(x) {
    if (!isObj(x)) {
        return false;
    }
    if (!('action' in x && 'tableChanges' in x)) {
        return false;
    }
    return true;
}
exports.isForestChange = isForestChange;
