"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asArray = exports.compareArrays = void 0;
function compareArrays(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    return a.every((value, index) => {
        return value === b[index];
    });
}
exports.compareArrays = compareArrays;
function asArray(value) {
    return Array.isArray(value) ? value : [value];
}
exports.asArray = asArray;
