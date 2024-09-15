"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isObj = isObj;
exports.isField = isField;
exports.isMutator = isMutator;
exports.isAssert = isAssert;
exports.isMapKey = isMapKey;
exports.isMutationValueProviderParams = isMutationValueProviderParams;
exports.isLocalValueProviderParams = isLocalValueProviderParams;
exports.isTruncationValueProviderParams = isTruncationValueProviderParams;
exports.isIttermittentCacheProviderParams = isIttermittentCacheProviderParams;
const types_shared_1 = require("./types.shared");
function isObj(a) {
    return Boolean(a && typeof a === 'object');
}
function isField(a) {
    if (!isObj(a)) {
        return false;
    }
    const o = a;
    return Boolean('name' in o &&
        'value' in o &&
        typeof o.name === 'string' &&
        (typeof o.value === 'number' || typeof o.value === 'string'));
}
function isMutator(a) {
    if (!isObj(a)) {
        return false;
    }
    return !!(a &&
        typeof a === 'object' &&
        'mutator' in a &&
        typeof a.mutator === 'function');
}
function isAssert(a) {
    if (!isObj(a)) {
        return false;
    }
    const o = a;
    return Boolean('assert' in o);
}
function isMapKey(map, a) {
    if (a === Symbol.iterator) {
        return true;
    }
    // @ts-ignore 7052
    return map instanceof Map && a in map;
}
function isMutationValueProviderParams(a) {
    if (!isObj(a)) {
        return false;
    }
    return Boolean('context' in a && a.context === types_shared_1.ValueProviderContext.mutation);
}
function isLocalValueProviderParams(a) {
    if (!isObj(a)) {
        return false;
    }
    return Boolean('context' in a && a.context === types_shared_1.ValueProviderContext.localCache);
}
function isTruncationValueProviderParams(a) {
    if (!isObj(a)) {
        return false;
    }
    return Boolean('context' in a && a.context === types_shared_1.ValueProviderContext.truncation);
}
function isIttermittentCacheProviderParams(a) {
    if (!isObj(a)) {
        return false;
    }
    return Boolean('context' in a && a.context === types_shared_1.ValueProviderContext.itermittentCache);
}
