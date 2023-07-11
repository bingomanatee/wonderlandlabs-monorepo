"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
class CanDIEntry {
    constructor(can, key, config, resource) {
        this.can = can;
        this.key = key;
        this.resource = resource;
        this._valueSent = false;
        if (key === 'finalValue')
            console.log('<<< constructor: config = ', config, 'value', resource);
        const { type, async, final, deps, args } = config;
        this.deps = Array.isArray(deps) ? deps : [];
        this.type = type;
        this.async = !!async;
        this.final = !!final;
        this.args = args || [];
        this.stream = new rxjs_1.BehaviorSubject(resource);
        this._watchResource();
    }
    _watchResource() {
        const self = this;
        this.stream.pipe((0, rxjs_1.map)((value) => self.transform(value))).subscribe((value) => this._onValue(value));
    }
    get fnArgs() {
        const depValues = this.deps.length ? this.can.gets(...this.deps) : [];
        const argValues = this.args.length ? this.args : [];
        return [...depValues, ...argValues];
    }
    fn(fn) {
        return (...params) => fn(...this.fnArgs, ...params);
    }
    next(value) {
        if (this.key === 'finalValue') {
            console.log('next value for entry ', this.key, '_valueSent ', this._valueSent, 'final:', this.final);
        }
        if (this.final && (this.can.has(this.key) || this._valueSent)) {
            console.error('attempt to update a finalized entry', this.key, 'with', value);
            throw new Error(`cannot update finalized entry ${this.key}`);
        }
        this.stream.next(value);
    }
    get value() {
        return this.stream.value;
    }
    transform(value) {
        let out = value;
        switch (this.type) {
            case 'value':
                out = value;
                break;
            case 'func':
                out = this.fn(value);
                break;
            case 'comp':
                out = this.fn(value)();
                break;
        }
        return out;
    }
    _onValue(value) {
        if (this.final && this._valueSent) {
            return;
        }
        if (this.deps.length && !this.can.has(this.deps)) {
            return;
        }
        if (this.async) {
            this._valueSent = true;
            this.can.pq.set(this.key, value);
        }
        else {
            this.can.events.next({ type: 'value', target: this.key, value });
        }
        this._valueSent = true;
    }
}
exports.default = CanDIEntry;
