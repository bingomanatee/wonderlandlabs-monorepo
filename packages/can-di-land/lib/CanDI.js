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
const utils_1 = require("./utils");
const lodash_isequal_1 = __importDefault(require("lodash.isequal"));
class CanDI {
    constructor(values, maxChangeLoops = 30) {
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
        this.maxChangeLoops = maxChangeLoops;
    }
    // ----------- change --------------
    set(key, value) {
        const entry = this.entry(key);
        if (!entry) {
            throw new Error(`cannot set value of entry: ${key}`);
        }
        entry.next(value);
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
    when(deps, once = true) {
        if (!deps) {
            throw new Error('when requires non-empty criteria');
        }
        const fr = (0, rxjs_1.filter)((vm) => {
            if (Array.isArray(deps)) {
                return deps.every((key) => vm.has(key));
            }
            return vm.has(deps);
        });
        const mp = (0, rxjs_1.map)((vm) => {
            if (Array.isArray(deps)) {
                return deps.map((key) => vm.get(key));
            }
            return vm.get(deps);
        });
        if (once) {
            return this.values.pipe(fr, mp, (0, rxjs_1.distinctUntilChanged)(lodash_isequal_1.default), (0, rxjs_1.first)());
        }
        return this.values.pipe(fr, mp, (0, rxjs_1.distinctUntilChanged)(lodash_isequal_1.default));
    }
    /**
     * this is an "old school" async function that returns a promise.
     * @param deps
     */
    getAsync(deps) {
        return new Promise((done, fail) => {
            let sub = undefined;
            sub = this.when(deps)
                .subscribe({
                next(value) {
                    done(value);
                    sub === null || sub === void 0 ? void 0 : sub.unsubscribe();
                },
                error(err) {
                    fail(err);
                }
            });
        });
    }
    complete() {
        this._eventSubs.forEach(sub => sub.unsubscribe());
    }
    _initPQ() {
        const self = this;
        this._pqSub = this.pq.events.subscribe((eventOrError) => {
            if ((0, types_1.isPromiseQueueMessage)(eventOrError)) {
                const { key, value } = eventOrError;
                self._onValue(key, value);
            }
            else {
                const { key, error } = eventOrError;
                self.events.next({ target: key, type: 'async-error', value: error });
            }
        });
    }
    _initEvents() {
        const self = this;
        this._eventSubs
            .push(this.events
            .pipe((0, rxjs_1.filter)(types_1.isEventValue))
            .subscribe({
            next: (event) => self._onValue(event.target, event.value),
            error: (err) => console.error('error on value event:', err)
        }));
        this._eventSubs
            .push(this.events.pipe((0, rxjs_1.filter)(types_1.isEventError))
            .subscribe({
            next(event) {
                self._onAsyncError(event.target, event.value);
            },
            error(e) {
                (0, utils_1.ce)('error on async error', e);
            }
        }));
        this._eventSubs
            .push(this.events
            .pipe((0, rxjs_1.filter)(types_1.isEventInit))
            .subscribe({
            next: (event) => self._onInit(event.target, event.value),
            error: (err) => (0, utils_1.ce)('error on init event:', err)
        }));
    }
    _onAsyncError(key, error) {
        (0, utils_1.ce)('async error thrown for ', key, error);
    }
    _onInit(key, data) {
        if (this.entries.has(key)) {
            (0, utils_1.ce)('key', key, 'initialized twice');
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
        const entry = new CanDIEntry_1.default(this, key, myConfig, value);
        entry.checkForLoop();
        this.entries.set(key, entry);
    }
    _onValue(key, value) {
        const map = new Map(this.values.value);
        map.set(key, value);
        this._updateComps(key, map);
        this.values.next(map);
    }
    entriesDepOn(key) {
        return Array.from(this.entries.values()).filter((entry) => {
            return entry.deps.includes(key);
        });
    }
    /**
     * This changes any comp values that depend on the changed value.
     * there may be downstream comps that depend on other comps;
     * to prevent wear and tear on the event loop, these downstream changes
     * are either pushed to pq or used to immediately update the map.
     *
     * This can cause a cascade loop; to prevent infinite cycling,
     * there is a maximum number of loop iterations that can happen in this method;
     * once that threshold is met,
     * the while loop exits and an error message is emitted.
     * However, the values are allowed to update to the value of the CanDI instance.
     *
     * This is to prevent circular loops from triggering each other
     * in an infinite loop.
     *
     * In a typical arrangement, nearly all comps will be driven by values,
     * not other comps, so you will only have one while loop --
     * none of the entries will push anything into changedKeys,
     * so you will just blow through all the downstream comps once and exit.
     *
     */
    _updateComps(key, map) {
        const changedKeys = [key];
        let loops = 0;
        const loopy = (str) => /-loop/.test(str);
        if (loopy(key)) {
            console.log('loop key changed:', key);
        }
        while (changedKeys.length > 0 && loops < this.maxChangeLoops) {
            ++loops;
            const key = changedKeys.shift();
            const dependants = this.entriesDepOn(key);
            dependants.forEach((entry) => {
                const entryKey = entry.key;
                if (entry.deps.includes(key) && entry.type === 'comp' && entry.active && entry.resolved(map)) {
                    let updatedValue;
                    updatedValue = entry.computeFor(map);
                    if (entry.async) {
                        this.pq.set(entryKey, updatedValue);
                        // the _onValue from the promise will eventually resolve and trigger an update cycle of its own
                    }
                    else if (map.has(entryKey)) {
                        if (map.get(entryKey) !== updatedValue) {
                            map.set(entryKey, updatedValue);
                            if (this.entriesDepOn(entryKey).length) {
                                changedKeys.push(entryKey);
                            } // if no other comps are driven by the value of this entry, no reason to give it a while loop cycle,
                        } // else -- the value of changed entry is already the same - no need to cascade compute derived comps
                    }
                    else {
                        // initial set of new computed value
                        map.set(entryKey, updatedValue);
                        changedKeys.push(entryKey);
                    }
                    /**
                     * at this point either
                     *     --- (async) --- a new async value has been pushed into pq and will ultimately trigger its own cycle later
                     * or  --- (sync) ---  the map has been updated with a new recomputed value from the entry (sync)
                     *                     AND its key as been pushed onto changed keys
                     *                     so we can see if there are any downstream comps which depend on it.
                     */
                }
            });
            if (changedKeys.length) {
                (0, utils_1.ce)('too many triggered changes for changing ', key, changedKeys);
            }
        }
    }
}
exports.CanDI = CanDI;
