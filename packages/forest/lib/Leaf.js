Object.defineProperty(exports, "__esModule", { value: !0 }),
  (exports.Leaf = void 0);
let constants_1 = require("./constants"),
  helpers_1 = require("./helpers");
class Leaf {
  constructor(e) {
    (this.treeName = e.treeName),
      (this.key = e.key),
      (this.val = (0, helpers_1.nf)(e.val));
  }
  get hasValue() {
    return (0, helpers_1.nf)(this.val) !== constants_1.NOT_FOUND;
  }
}
exports.Leaf = Leaf;
