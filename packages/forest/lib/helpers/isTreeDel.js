"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTreeDel = isTreeDel;
const isChangeIF_1 = require("./isChangeIF");
const enums_1 = require("./enums");
function isTreeDel(a) {
    if (!(0, isChangeIF_1.isChangeIF)(a)) {
        return false;
    }
    return a.type === enums_1.ChangeTypeEnum.del;
}
