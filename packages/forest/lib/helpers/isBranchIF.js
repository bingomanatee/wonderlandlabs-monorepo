"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDataIF = isDataIF;
exports.isForestIF = isForestIF;
exports.isTreeIF = isTreeIF;
exports.isBranchIF = isBranchIF;
const isObj_1 = require("./isObj");
const isString_1 = require("./isString");
function isDataIF(a) {
    if (!(0, isObj_1.isObj)(a)) {
        return false;
    }
    const o = a;
    return "leaf,get,has,set,del,change"
        .split(",")
        .every((key) => key in o);
}
function isForestIF(a) {
    if (!(0, isObj_1.isObj)(a)) {
        return false;
    }
    const o = a;
    return ("tree" in o &&
        typeof o.tree === "function" &&
        "has,hasAll,hasree,currentScope".split(",").every((key) => key in a));
}
function isTreeIF(a) {
    if (!(0, isObj_1.isObj)(a)) {
        return false;
    }
    const o = a;
    return "name" in o && "forest" in o && isDataIF(o) && isForestIF(o.forest);
}
function isBranchIF(a) {
    if (!(0, isObj_1.isObj)(a)) {
        return false;
    }
    const o = a;
    return "treeName" in o && (0, isString_1.isString)(o.treeName) && "key" in o && "val" in o;
}
