"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 }),
  (exports.DependencyAnalyzer = void 0);
const collect_1 = require("@wonderlandlabs/collect"),
  utils_1 = require("./utils");
class DependencyAnalyzer {
  constructor(e) {
    (this.can = e),
      (this.dependsOn = new Map()),
      e.entries.forEach((e, s) => {
        e.deps.forEach((e) => {
          this._addDep(s, e);
        });
      });
  }
  get errors() {
    const t = [];
    return (
      this.dependsOn.forEach((e, s) => {
        e.forEach((e) => {
          this.loop(s, e) && t.push({ msg: "loop", root: s, to: e });
        });
      }),
      t
    );
  }
  _trace(s) {
    var e = s[s.length - 1];
    this.dependsOn.has(e) &&
      this.dependsOn.get(e).forEach((e) => {
        if (s.includes(e))
          throw Object.assign(new Error("loop"), { path: [...s, e] });
        this._trace([...s, e]);
      });
  }
  loop(e, s) {
    try {
      this._trace([e, s]);
    } catch (e) {
      return !0;
    }
    return !1;
  }
  _addDep(e, s) {
    this.dependsOn.has(e)
      ? this.dependsOn.get(e).includes(s) || this.dependsOn.get(e).push(s)
      : this.dependsOn.set(e, [s]);
  }
  updateComputed(s, t) {
    if (null != (e = this.errors) && e.length)
      (0, utils_1.ce)("cannot update dependencies - loop:", this.errors);
    else {
      var e = Array.from(
        (0, collect_1.c)(this.dependsOn)
          .getMap((e, s) => new DepNode(this, s, e))
          .values(),
      );
      const r = new Map();
      e.forEach((e) => r.set(e.key, e)),
        e.forEach((e) => e.link(r)),
        e
          .filter((e) => e.isRoot)
          .forEach((e) => {
            e.recompute(s, t, []);
          });
    }
  }
}
exports.DependencyAnalyzer = DependencyAnalyzer;
class DepNode {
  constructor(e, s, t) {
    (this.da = e),
      (this.key = s),
      (this.deps = t),
      (this.parentNodes = new Map()),
      (this.childNodes = new Map());
  }
  get isRoot() {
    return 0 === this.parentNodes.size;
  }
  recompute(s, t, r) {
    var e = this.da.can;
    this.childNodes.forEach((e) => e.recompute(s, t, r)),
      null != (e = e.entries.get(this.key)) &&
        e.final &&
        !s.has(this.key) &&
        this.deps.every((e) => s.has(e)) &&
        this.deps.some((e) => r.includes(e) || t.has(e));
  }
  link(s) {
    this.deps.forEach((e) => {
      e = s.get(e);
      e && (e.parentNodes.set(this.key, this), this.childNodes.set(e.key, e));
    });
  }
}
