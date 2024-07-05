"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLeafJSON = void 0;
const types_1 = require("../types");
function isLeafJSON(a) {
  return (
    !!(a && typeof a === "object") &&
    "collection" in a &&
    (0, types_1.isNonEmptyString)(a.collection) &&
    "identity" in a
  );
}
exports.isLeafJSON = isLeafJSON;
