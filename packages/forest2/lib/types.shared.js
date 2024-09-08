"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMutator = isMutator;
function isMutator(a) {
    return !!(a &&
        typeof a === "object" &&
        "next" in a &&
        typeof a.next === "function");
}
