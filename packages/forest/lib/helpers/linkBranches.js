"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkBranches = linkBranches;
function linkBranches(a, b) {
    if (a) {
        a.next = b;
    }
    if (b) {
        b.prev = a;
    }
}
