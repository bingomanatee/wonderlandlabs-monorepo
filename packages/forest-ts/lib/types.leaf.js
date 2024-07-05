"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 }),
  (exports.isLeafJSON = void 0);
const types_1 = require("./types");
function isLeafJSON(e) {
  return (
    !(!e || "object" != typeof e) &&
    "collection" in e &&
    (0, types_1.isNonEmptyString)(e.collection) &&
    "identity" in e
  );
}
exports.isLeafJSON = isLeafJSON;
