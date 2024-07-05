Object.defineProperty(exports, "__esModule", { value: !0 });
let enums_1 = require("./helpers/enums");
class Scope {
  constructor(e, s) {
    this.inTrees = new Set();
    var { cause: t, name: n, status: a } = s;
    (this.name = n || "transaction"),
      (this.id = e.nextBranchId()),
      (this.scopeID = s.scopeID || this.name + "-" + this.id),
      (this.cause = t || enums_1.BranchActionEnum.trans),
      (this.status = a || enums_1.StatusEnum.pending),
      (this.async = !1);
  }
}
exports.default = Scope;
