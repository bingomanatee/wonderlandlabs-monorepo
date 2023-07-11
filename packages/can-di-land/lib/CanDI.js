"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanDI = void 0;
const rxjs_1 = require("rxjs");
const types_1 = require("./types");
const PromiseQueue_1 = require("./PromiseQueue");
const CanDIEntry_1 = __importDefault(require("./CanDIEntry"));
class CanDI {
    constructor(values) {
        this.values = new rxjs_1.BehaviorSubject(new Map());
        this.entries = new Map();
        this.events = new rxjs_1.Subject();
        this.pq = new PromiseQueue_1.PromiseQueue();
        // --------------- event management -------------
        this._eventSubs = [];
        this._initEvents();
        this._initPQ();
        values === null || values === void 0 ? void 0 : values.forEach((val) => {
            this.events.next({ type: 'init', target: val.key, value: val });
            // would it be better to initialize the can's props "en masse"?
        });
    }
    // ----------- change --------------
    set(key, value) {
        const entry = this.entry(key);
        if (!entry) {
            throw new Error(`cannot set value of entry: ${key}`);
        }
        if (key === 'finalValue')
            console.log('----- setting ', key, value);
        entry.next(value);
        if (key === 'finalValue')
            console.log('-----  DONE setting ', key, value);
    }
    add(key, value, config) {
        if (this.entries.has(key)) {
            throw new Error(`cannot redefine entry ${key}`);
        }
        if (!config) {
            return this.add(key, value, { type: 'value' });
        }
        if (typeof config === 'string') {
            return this.add(key, value, { type: config });
        }
        this.events.next({ type: 'init', target: key, value: { key, value, config } });
    }
    // ------- introspection/querying --------------
    get(key) {
        const map = this.values.value;
        return map.has(key) ? map.get(key) : undefined;
    }
    gets(keys) {
        return keys.map(key => this.get(key));
    }
    has(key) {
        if (Array.isArray(key)) {
            return key.every((subKey) => this.has(subKey));
        }
        return this.values.value.has(key);
    }
    entry(key) {
        return this.entries.get(key);
    }
    complete() {
        this._eventSubs.forEach(sub => sub.unsubscribe());
    }
    _initPQ() {
        const self = this;
        this._pqSub = this.pq.events.subscribe(({ key, value }) => {
            self._onValue(key, value);
        });
    }
    _initEvents() {
        this._eventSubs
            .push(this.events
            .pipe((0, rxjs_1.filter)(types_1.isEventValue))
            .subscribe((event) => this._onValue(event.target, event.value)));
        this._eventSubs
            .push(this.events
            .pipe((0, rxjs_1.filter)(types_1.isEventInit))
            .subscribe((event) => this._onInit(event.target, event.value)));
    }
    _onInit(key, data) {
        if (this.entries.has(key)) {
            console.error('key', key, 'initialized twice');
            return;
        }
        const { config, type, value } = data;
        let myConfig = config;
        if (!myConfig) {
            if (!type) {
                myConfig = { type: 'value' };
            }
            else {
                myConfig = { type };
            }
        }
        if (key === 'finalValue') {
            console.log('========= data for', key, data);
            console.log('======== values for ', key, 'config:', config, 'my', myConfig, 'value:', value);
        }
        this.entries.set(key, new CanDIEntry_1.default(this, key, myConfig, value));
    }
    _onValue(key, value) {
        const map = new Map(this.values.value);
        map.set(key, value);
        this.values.next(map);
    }
}
exports.CanDI = CanDI;
