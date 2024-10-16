"use strict";
function compareArrays(r, o) {
  return r.length === o.length && r.every((r, e) => r === o[e]);
}
function asArray(r) {
  return Array.isArray(r) ? r : [r];
}
function mergeMap(r, e) {
  const o = new Map(r);
  return e.forEach((r, e) => o.set(e, r)), o;
}
Object.defineProperty(exports, "__esModule", { value: !0 }),
  (exports.ce =
    exports.mergeMap =
    exports.asArray =
    exports.compareArrays =
      void 0),
  (exports.compareArrays = compareArrays),
  (exports.asArray = asArray),
  (exports.mergeMap = mergeMap);
const TEST_MODE = !1;
function ce(...r) {
  TEST_MODE || console.error(...r);
}
exports.ce = ce;
