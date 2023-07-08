"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromiseQueue = void 0;
const rxjs_1 = require("rxjs");
const types_1 = require("./types");
/**
 * This class keeps a list of pending promises and emitts a key-value pair when a promise completes.
 * The catch is -- if a new promise is enqueued before an old promise completes,
 * the prior promise's value is ignored. This follows the "debounce" pattern.
 */
class PromiseQueue {
    constructor() {
        this.promises = new Map();
        this.events = new rxjs_1.Subject();
    }
    set(key, promise) {
        var _a;
        if (!(0, types_1.isPromise)(promise)) {
            promise = Promise.resolve(promise);
        }
        (_a = this.promises.get(key)) === null || _a === void 0 ? void 0 : _a.complete();
        const subject = this._asSubject(key, promise);
        this.promises.set(key, subject);
        return this;
    }
    _asSubject(key, promise) {
        const self = this;
        const subject = new rxjs_1.Subject();
        promise.then((value) => {
            if (!subject.closed) {
                subject.next(value);
            }
        }).catch((err) => {
            console.error('error in PromiseQueue: ', key, err);
        });
        subject.subscribe({
            error(err) {
                console.warn('error on PromiseQueue:', key, err);
            },
            next(value) {
                self.events.next({ key, value });
            }
        });
        return subject;
    }
}
exports.PromiseQueue = PromiseQueue;
