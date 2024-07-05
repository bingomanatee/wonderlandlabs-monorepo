"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLeafIF = isLeafIF;
const isObj_1 = require("./isObj");
const isString_1 = require("./isString");
function isLeafIF(a) {
    if (!(0, isObj_1.isObj)(a)) {
        return false;
    }
    const o = a;
    return "treeName" in o && (0, isString_1.isString)(o.treeName) && "key" in o && "val" in o;
}
