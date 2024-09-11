"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isObj = isObj;
exports.isField = isField;
exports.isMutator = isMutator;
exports.isAssert = isAssert;
exports.hasCachingParams = hasCachingParams;
exports.isMapKey = isMapKey;
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
function hasCachingParams(a) {
    if (!isObj(a)) {
        return false;
    }
    const o = a;
    if (!('cloner' in o && 'cloneInterval' in o)) {
        return false;
    }
    return typeof o.cloner === 'function' && typeof o.cloneInterval === 'number';
}
function isMapKey(map, a) {
    if (a === Symbol.iterator) {
        return true;
    }
    // @ts-ignore 7052
    return map instanceof Map && a in map;
}
