"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLeafIdentityIF = isLeafIdentityIF;
const isObj_1 = require("./isObj");
const isString_1 = require("./isString");
function isLeafIdentityIF(a) {
    if (!(0, isObj_1.isObj)(a)) {
        return false;
    }
    const o = a;
    return "treeName" in o && (0, isString_1.isString)(o.treeName) && "key" in o;
}
