"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (e) {
    return e && e.__esModule ? e : { default: e };
  };
Object.defineProperty(exports, "__esModule", { value: !0 }),
  (exports.TreeClass = void 0);
const collect_1 = require("@wonderlandlabs/collect"),
  walrus_1 = require("@wonderlandlabs/walrus"),
  lodash_1 = require("lodash"),
  CollectionClass_1 = __importDefault(require("./CollectionClass")),
  ErrorPlus_1 = require("./ErrorPlus"),
  Leaf_1 = require("./Leaf"),
  rxjs_1 = require("rxjs"),
  JoinIndex_1 = __importDefault(require("./JoinIndex")),
  TransManager_1 = __importDefault(require("./TransManager")),
  types_query_and_join_1 = require("./types/types.query-and-join");
function prefix(e) {
  return "string" == typeof e
    ? prefix([e])
    : e.map((e) => walrus_1.text.addBefore(e, "$value."));
}
class TreeClass {
  constructor(e, r) {
    (this.$collections = new Map()),
      (this.joins = new Map()),
      (this._indexes = new Map()),
      (this.updates = new rxjs_1.Subject()),
      null != e && e.forEach((e) => this.addCollection(e)),
      null != r && r.forEach((e) => this.addJoin(e));
  }
  addCollection(e) {
    if (!e.name) throw new Error("addCollection requires name");
    if (this.hasCollection(e.name))
      throw new Error("cannot redefine collection " + e.name);
    var r = null != (r = e.records) ? r : [];
    delete e.records,
      this.$collections.set(e.name, new CollectionClass_1.default(this, e, r)),
      this.updates.next({ action: "add-collection", collection: e.name });
  }
  addJoin(e) {
    if (this.joins.has(e.name))
      throw new ErrorPlus_1.ErrorPlus(
        "cannot redefine existing join " + e.name,
        { join: e, tree: this },
      );
    this.joins.set(e.name, e),
      this._indexes.set(e.name, new JoinIndex_1.default(this, e.name));
  }
  do(e, r) {
    this.$_transManager ||
      (this.$_transManager = new TransManager_1.default(this));
    var o = this.$_transManager.start(r);
    try {
      var t = e(this, ...((null == r ? void 0 : r.args) || []));
      return o.complete(), t;
    } catch (e) {
      throw (o.fail(), e);
    }
  }
  collection(e) {
    if (this.$collections.has(e)) return this.$collections.get(e);
    throw new ErrorPlus_1.ErrorPlus("cannot get collection", e);
  }
  get(e, r) {
    return this.collection(e).get(r);
  }
  put(e, r) {
    if (this.$collections.has(e)) return this.collection(e).put(r);
    throw new ErrorPlus_1.ErrorPlus("Tree.put: missing target collection", {
      collection: e,
      value: r,
    });
  }
  query(e) {
    return this.collection(e.collection).query(e);
  }
  fetch(e) {
    return this.collection(e.collection).fetch(e);
  }
  findMatchingJoins(o, t) {
    return (0, collect_1.c)(this.joins).getReduce(
      (e, r) => (
        ((r.from === o && r.to === t) || (r.to === o && r.from === t)) &&
          e.push(r),
        e
      ),
      [],
    );
  }
  leaf(n, s, i) {
    const l = new Leaf_1.Leaf(this, n, s);
    return (
      null != i &&
        i.joins &&
        i.joins.forEach((e) => {
          let r;
          if ((0, types_query_and_join_1.isQueryNamedDefJoin)(e)) {
            if (!this.joins.has(e.name))
              throw new ErrorPlus_1.ErrorPlus(
                "cannot find query join " + e.name,
                e,
              );
            if (!this._indexes.has(e.name))
              throw new ErrorPlus_1.ErrorPlus("no index for join " + e.name, e);
            r = this.joins.get(e.name);
          } else {
            if (!(0, types_query_and_join_1.isQueryCollectionDefJoin)(e))
              throw new ErrorPlus_1.ErrorPlus("join is not proper", e);
            var o = this.findMatchingJoins(n, e.collection);
            switch (o.length) {
              case 0:
                throw new Error(
                  `cannot find amy joins between ${n} and ` + e.collection,
                );
              case 1:
                r = o[0];
                break;
              default:
                throw new ErrorPlus_1.ErrorPlus(
                  `there are two or more joins between ${n} and ${e.collection} -- you must name the specific join you want to use`,
                  i,
                );
            }
          }
          let t;
          try {
            t = this._indexes.get(r.name);
          } catch (o) {
            throw (
              (console.log("---- error getting index for ", r, "from join", e),
              o)
            );
          }
          r.to === n
            ? (l.$joins[r.name] = t.toLeafsFor(s, e))
            : (l.$joins[r.name] = t.fromLeafsFor(s, e)),
            e.sorter &&
              ("function" == typeof e.sorter
                ? (l.$joins[r.name] = l.$joins[r.name].sort(e.sorter))
                : (l.$joins[r.name] = (0, lodash_1.sortBy)(
                    l.$joins[r.name],
                    prefix(e.sorter),
                  )));
        }),
      l
    );
  }
  has(e, r) {
    return this.$collections.has(e) && this.$collections.get(e).has(r);
  }
  hasCollection(e) {
    return this.$collections.has(e);
  }
  unPut(e) {
    this.hasCollection(e.collection) && this.collection(e.collection).unPut(e);
  }
  revert(e) {
    const r = new Set();
    [...e].reverse().forEach((e) => {
      [...e.puts].reverse().forEach((e) => {
        this.unPut(e), r.add(e.collection);
      });
    }),
      r.forEach((e) => {
        null != (e = this.collection(e)) && e.finishRevert();
      });
  }
}
exports.TreeClass = TreeClass;
