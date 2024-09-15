"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 }),
  (exports.PromiseQueue = void 0);
const rxjs_1 = require("rxjs"),
  types_1 = require("./types"),
  utils_1 = require("./utils");
class PromiseQueue {
  constructor() {
    (this.promises = new Map()), (this.events = new rxjs_1.Subject());
  }
  set(e, s) {
    (0, types_1.isPromise)(s) || (s = Promise.resolve(s)),
      null != (r = this.promises.get(e)) && r.complete();
    var r = this._asSubject(e, s);
    return this.promises.set(e, r), this;
  }
  has(e) {
    return this.promises.has(e);
  }
  _asSubject(s, e) {
    const r = this,
      t = new rxjs_1.Subject();
    return (
      e
        .then((e) => {
          t.closed || t.next(e);
        })
        .catch((e) => {
          (0, utils_1.ce)("error in PromiseQueue: ", s, e),
            r.events.next({ key: s, error: e });
        }),
      t.subscribe({
        error(e) {
          (0, utils_1.ce)("error on PromiseQueue:", s, e);
        },
        next(e) {
          r.events.next({ key: s, value: e });
        },
      }),
      t
    );
  }
}
exports.PromiseQueue = PromiseQueue;
