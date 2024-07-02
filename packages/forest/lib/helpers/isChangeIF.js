"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isChangeIF = isChangeIF;
const isObj_1 = require("./isObj");
const isChangeType_1 = require("./isChangeType");
function isChangeIF(arg) {
    if (!(0, isObj_1.isObj)(arg))
        return false;
    const o = arg;
    if (!(0, isChangeType_1.isChangeType)(o.type))
        return false;
    return ('key' in o || 'val' in o || 'data' in o);
}
