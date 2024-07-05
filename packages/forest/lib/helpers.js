Object.defineProperty(exports, "__esModule", { value: !0 }),
  (exports.mp = mp),
  (exports.nf = nf),
  (exports.delToUndef = delToUndef);
let constants_1 = require("./constants");
function mp(...n) {
  for (var e = []; 1 < n.length; ) e.push(n.splice(0, 2));
  return new Map(e);
}
function nf(n) {
  return n === constants_1.DELETED || void 0 === n ? constants_1.NOT_FOUND : n;
}
function delToUndef(n) {
  if (n !== constants_1.DELETED) return n;
}
