"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isChangeType = isChangeType;
const enums_1 = require("./enums");
function isChangeType(arg) {
    return typeof arg === "symbol" && enums_1.ChangeTypeEnumValues.includes(arg);
}
