"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 });
const rxjs_1 = require("rxjs"),
  utils_1 = require("./utils");
class CanDIEntry {
  constructor(e, t, s, i) {
    (this.can = e), (this.key = t), (this.resource = i), (this._valueSent = !1);
    var { type: e, async: s, final: n, deps: r, args: a } = s;
    if (
      ((this.deps = Array.isArray(r) ? r : []),
      (this.type = e),
      this.deps.length && "value" === this.type)
    )
      throw new Error("cannot define dependencies on value types for " + t);
    (this.async = !!s),
      (this.final = !!n),
      (this.args = a || []),
      (this.stream = new rxjs_1.BehaviorSubject(i)),
      this._watchResource();
  }
  _watchResource() {
    const t = this;
    this.stream
      .pipe((0, rxjs_1.map)((e) => t.transform(e)))
      .subscribe((e) => this._onValue(e));
  }
  fnArgs(e) {
    var t = this.args.length ? this.args : [];
    return [...this.depValues(e), ...t];
  }
  depValues(t) {
    return this.deps.length
      ? t
        ? this.deps.map((e) => t.get(e))
        : this.can.gets(this.deps)
      : [];
  }
  fn(t, s) {
    return (...e) => t(...this.fnArgs(s), ...e);
  }
  computeFor(e) {
    var t = this.value;
    if ("function" != typeof t)
      throw new Error(this.key + " cannot computeFor -- non function");
    return this.fn(t, e)();
  }
  next(e) {
    if (this.final && (this.can.has(this.key) || this._valueSent))
      throw (
        ((0, utils_1.ce)(
          "attempt to update a finalized entry",
          this.key,
          "with",
          e,
        ),
        new Error("cannot update finalized entry " + this.key))
      );
    this.stream.next(e);
  }
  get value() {
    return this.stream.value;
  }
  transform(e) {
    let t = e;
    switch (this.type) {
      case "value":
        t = e;
        break;
      case "func":
        t = this.fn(e);
        break;
      case "comp":
        t = this.fn(e)();
    }
    return t;
  }
  get active() {
    return !(this.final && this._valueSent);
  }
  resolved(t) {
    return (
      !this.deps.length ||
      (t ? this.deps.every((e) => t.has(e)) : this.can.has(this.deps))
    );
  }
  _onValue(e) {
    (this.final && this._valueSent) ||
      (this.deps.length && !this.can.has(this.deps)) ||
      (this.async
        ? ((this._valueSent = !0), this.can.pq.set(this.key, e))
        : this.can.events.next({ type: "value", target: this.key, value: e }),
      (this._valueSent = !0));
  }
  checkForLoop(e) {
    var t = (e) => {
      e = this.can.entries.get(e);
      if (e) {
        if (e.deps.includes(this.key))
          throw new Error(
            `infinite dependency loop between ${this.key} and ` + e.key,
          );
        this.checkForLoop(e);
      }
    };
    (e || this).deps.forEach(t);
  }
}
exports.default = CanDIEntry;
