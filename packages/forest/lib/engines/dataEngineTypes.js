"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMultiDel = isMultiDel;
exports.isSingleDel = isSingleDel;
exports.isDel = isDel;
const types_1 = require("../types");
function isMultiDel(a) {
    return (0, types_1.isObj)(a) && "delKeys" in a;
}
function isSingleDel(a) {
    return (0, types_1.isObj)(a) && "delKey" in a;
}
function isDel(a) {
    return isSingleDel(a) || isMultiDel(a);
}
