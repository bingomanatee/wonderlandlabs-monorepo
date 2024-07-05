Object.defineProperty(exports, "__esModule", { value: !0 }),
  (exports.Tree = void 0);
let enums_1 = require("./helpers/enums"),
  Branch_1 = require("./Branch"),
  Leaf_1 = require("./Leaf"),
  helpers_1 = require("./helpers"),
  isTreeSet_1 = require("./helpers/isTreeSet"),
  isTreeDel_1 = require("./helpers/isTreeDel"),
  constants_1 = require("./constants");
class Tree {
  constructor(e) {
    this.activeScopeCauseIDs = new Set();
    var { forest: e, treeName: t, data: r } = e;
    (this.forest = e),
      (this.name = t),
      r &&
        (this.root = new Branch_1.Branch(this, {
          data: r,
          cause: enums_1.BranchActionEnum.init,
        }));
  }
  endScope(e) {
    let t = this.top;
    for (; t; ) {
      if (t.causeID === e) {
        t.pop();
        break;
      }
      t = t.next;
    }
    this.activeScopeCauseIDs.delete(e);
  }
  pruneScope(e) {
    let t = this.top;
    for (; t; ) {
      if (t.causeID === e) {
        t.prune();
        break;
      }
      t = t.next;
    }
    this.activeScopeCauseIDs.delete(e);
  }
  get size() {
    let r = new Set(),
      e = this.root;
    for (; e; ) e.data.forEach((e, t) => r.add(t)), (e = e.next);
    return r.size;
  }
  values() {
    return this.root ? this.root.values() : new Map();
  }
  clearValues() {
    var e = this.branches;
    return (this.root = void 0), e;
  }
  get branches() {
    var e = [];
    let t = this.root;
    for (; t; ) e.push(t), (t = t.next);
    return e;
  }
  get top() {
    if (this.root) {
      let e = this.root;
      for (; e && e.next; ) e = e.next;
      return e;
    }
  }
  leaf(e) {
    return this.root
      ? this.root.leaf(e)
      : new Leaf_1.Leaf({
          treeName: this.name,
          key: e,
          val: constants_1.NOT_FOUND,
        });
  }
  get(e) {
    if (this.root) return this.top?.get(e);
  }
  has(e) {
    return !!this.root && !!this.top?.has(e);
  }
  maybeCache(e) {
    return;
  }
  addBranch(e, t, r) {
    e = new Branch_1.Branch(this, {
      data: (0, helpers_1.mp)(e, t),
      cause: enums_1.BranchActionEnum.set,
    });
    return this.top
      ? ((e.prev = this.top), (this.top.next = e))
      : (this.root = e);
  }
  set(e, t) {
    return this.addBranch(e, t, enums_1.BranchActionEnum.set), this.top.get(e);
  }
  del(e) {
    return (
      this.addBranch(e, constants_1.DELETED, enums_1.BranchActionEnum.del),
      this.top.get(e)
    );
  }
  get status() {
    return enums_1.StatusEnum.good;
  }
  change(e) {
    if ((0, isTreeSet_1.isTreeSet)(e)) this.set(e.key, e.val);
    else {
      if (!(0, isTreeDel_1.isTreeDel)(e)) throw new Error("not implemented");
      this.del(e.key);
    }
    return { treeName: this.name, change: e, status: this.status };
  }
}
exports.Tree = Tree;
