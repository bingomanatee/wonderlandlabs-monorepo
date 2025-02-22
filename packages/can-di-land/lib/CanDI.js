"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (e) {
    return e && e.__esModule ? e : { default: e };
  };
Object.defineProperty(exports, "__esModule", { value: !0 }),
  (exports.CanDI = void 0);
const rxjs_1 = require("rxjs"),
  types_1 = require("./types"),
  PromiseQueue_1 = require("./PromiseQueue"),
  CanDIEntry_1 = __importDefault(require("./CanDIEntry")),
  utils_1 = require("./utils"),
  lodash_isequal_1 = __importDefault(require("lodash.isequal"));
class CanDI {
  constructor(e, t = 30) {
    (this.values = new rxjs_1.BehaviorSubject(new Map())),
      (this.entries = new Map()),
      (this.events = new rxjs_1.Subject()),
      (this.pq = new PromiseQueue_1.PromiseQueue()),
      (this._eventSubs = []),
      this._initEvents(),
      this._initPQ(),
      null != e &&
        e.forEach((e) => {
          this.events.next({ type: "init", target: e.key, value: e });
        }),
      (this.maxChangeLoops = t);
  }
  set(e, t) {
    var s = this.entry(e);
    if (!s) throw new Error("cannot set value of entry: " + e);
    s.next(t);
  }
  add(e, t, s) {
    if (this.entries.has(e)) throw new Error("cannot redefine entry " + e);
    return s
      ? "string" == typeof s
        ? this.add(e, t, { type: s })
        : void this.events.next({
            type: "init",
            target: e,
            value: { key: e, value: t, config: s },
          })
      : this.add(e, t, { type: "value" });
  }
  get(e) {
    var t = this.values.value;
    return t.has(e) ? t.get(e) : void 0;
  }
  gets(e) {
    return e.map((e) => this.get(e));
  }
  has(e) {
    return Array.isArray(e)
      ? e.every((e) => this.has(e))
      : this.values.value.has(e);
  }
  entry(e) {
    return this.entries.get(e);
  }
  when(e, t = !0) {
    var s, r;
    if (e)
      return (
        (s = (0, rxjs_1.filter)((t) =>
          Array.isArray(e) ? e.every((e) => t.has(e)) : t.has(e),
        )),
        (r = (0, rxjs_1.map)((t) =>
          Array.isArray(e) ? e.map((e) => t.get(e)) : t.get(e),
        )),
        t
          ? this.values.pipe(
              s,
              r,
              (0, rxjs_1.distinctUntilChanged)(lodash_isequal_1.default),
              (0, rxjs_1.first)(),
            )
          : this.values.pipe(
              s,
              r,
              (0, rxjs_1.distinctUntilChanged)(lodash_isequal_1.default),
            )
      );
    throw new Error("when requires non-empty criteria");
  }
  getAsync(e) {
    return new Promise((t, s) => {
      let r = void 0;
      r = this.when(e).subscribe({
        next(e) {
          t(e), null !== r && void 0 !== r && r.unsubscribe();
        },
        error(e) {
          s(e);
        },
      });
    });
  }
  complete() {
    this._eventSubs.forEach((e) => e.unsubscribe());
  }
  _initPQ() {
    const r = this;
    this._pqSub = this.pq.events.subscribe((e) => {
      var t, s;
      (0, types_1.isPromiseQueueMessage)(e)
        ? (({ key: t, value: s } = e), r._onValue(t, s))
        : (({ key: t, error: s } = e),
          r.events.next({ target: t, type: "async-error", value: s }));
    });
  }
  _initEvents() {
    const t = this;
    this._eventSubs.push(
      this.events
        .pipe((0, rxjs_1.filter)(types_1.isEventValue))
        .subscribe({
          next: (e) => t._onValue(e.target, e.value),
          error: (e) => console.error("error on value event:", e),
        }),
    ),
      this._eventSubs.push(
        this.events.pipe((0, rxjs_1.filter)(types_1.isEventError)).subscribe({
          next(e) {
            t._onAsyncError(e.target, e.value);
          },
          error(e) {
            (0, utils_1.ce)("error on async error", e);
          },
        }),
      ),
      this._eventSubs.push(
        this.events
          .pipe((0, rxjs_1.filter)(types_1.isEventInit))
          .subscribe({
            next: (e) => t._onInit(e.target, e.value),
            error: (e) => (0, utils_1.ce)("error on init event:", e),
          }),
      );
  }
  _onAsyncError(e, t) {
    (0, utils_1.ce)("async error thrown for ", e, t);
  }
  _onInit(t, s) {
    if (this.entries.has(t)) (0, utils_1.ce)("key", t, "initialized twice");
    else {
      var { config: s, type: r, value: i } = s;
      let e = s;
      e = e || (r ? { type: r } : { type: "value" });
      s = new CanDIEntry_1.default(this, t, e, i);
      s.checkForLoop(), this.entries.set(t, s);
    }
  }
  _onValue(e, t) {
    var s = new Map(this.values.value);
    s.set(e, t), this._updateComps(e, s), this.values.next(s);
  }
  entriesDepOn(t) {
    return Array.from(this.entries.values()).filter((e) => e.deps.includes(t));
  }
  _updateComps(r, i) {
    const n = [r];
    let e = 0;
    for (; 0 < n.length && e < this.maxChangeLoops; ) {
      ++e;
      const r = n.shift();
      this.entriesDepOn(r).forEach((e) => {
        var t,
          s = e.key;
        e.deps.includes(r) &&
          "comp" === e.type &&
          e.active &&
          e.resolved(i) &&
          ((t = e.computeFor(i)),
          e.async
            ? this.pq.set(s, t)
            : i.has(s)
              ? i.get(s) !== t &&
                (i.set(s, t), this.entriesDepOn(s).length) &&
                n.push(s)
              : (i.set(s, t), n.push(s)));
      });
    }
    n.length &&
      (0, utils_1.ce)("too many triggered changes for changing ", r, n);
  }
}
exports.CanDI = CanDI;
