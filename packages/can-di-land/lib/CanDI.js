"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanDI = void 0;
const rxjs_1 = require("rxjs");
const types_1 = require("./types");
function compareArrays(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    return a.every((value, index) => {
        return value === b[index];
    });
}
/**
 * tracks resources added, with defined dependencies, an optional list of registry names.
 * note - resources are added immediately on the call of "set" -- however
 * if they have undefined dependencies, they are "pending"
 * -- their value will be undefined
 * until the dependencies are resolved.
 */
class CanDI {
    constructor(values) {
        this.configs = new Map();
        this.values = new rxjs_1.BehaviorSubject(new Map());
        this.resources = new Map();
        this.resEvents = new rxjs_1.Subject();
        this._listenForEvents();
        values === null || values === void 0 ? void 0 : values.forEach((val) => {
            let config = val.config;
            if (!config) {
                if (val.type) {
                    config = { type: val.type };
                }
                else {
                    config = { type: 'value' };
                }
            }
            this.resEvents.next({
                value: {
                    // @ts-ignore
                    resource: val.value,
                    config
                }, target: val.name, type: 'init'
            });
        });
    }
    _listenForEvents() {
        const self = this;
        this._resEventSub = this.resEvents.subscribe((event) => {
            switch (event.type) {
                case 'init':
                    if (self.configs.has(event.target)) {
                        throw new Error('cannot re-configure ' + event.target);
                    }
                    self.configs.set(event.target, event.value.config);
                    if ('resource' in event.value) {
                        self.resEvents.next({ type: 'resource', target: event.target, value: event.value.resource });
                    }
                    break;
                case 'resource':
                    if (self.configs.has(event.target)) {
                        self.updateResource(event.target, event.value);
                    }
                    else {
                        console.warn('--- resEvents: resource updated without config', event);
                    }
                    break;
            }
        });
    }
    updateResource(key, resource) {
        const config = this.configs.get(key);
        if (!config) {
            console.warn('un-documented resource:', key);
            return;
        }
        if (config.final && this.resources.has(key)) {
            console.warn('attempt to re-define a final key ', key);
            return;
        }
        this._updateResource(key, resource);
        switch (config.type) {
            case 'value':
                if (config.async) {
                    (() => __awaiter(this, void 0, void 0, function* () {
                        let resolved = yield resource;
                        this._setValue(key, resolved);
                    }))();
                }
                else {
                    this._setValue(key, resource);
                }
                break;
            case 'comp':
                if (config.async) {
                    (() => __awaiter(this, void 0, void 0, function* () {
                        const response = yield this.metaFunction(key)();
                        this._setValue(key, response);
                    }))();
                }
                else {
                    this._setValue(key, this.metaFunction(key)()); // sets the _value_ of the metaFunction
                }
                break;
            case 'func':
                this._setValue(key, this.metaFunction(key)); // sets the metaFunction itself
                break;
            default:
                console.warn('bad type for key ', key, ':', config.type);
        }
    }
    _updateResource(key, resource) {
        this.resources.set(key, resource);
    }
    /**
     * upserts a value into the values object.
     * We assume all safeguards have been checked
     * by the calling context.
     *
     * @param key
     * @param value
     */
    _setValue(key, value) {
        const map = new Map(this.values.value);
        map.set(key, value);
        this.values.next(map);
    }
    // ------------------------- IO methods ------------------------
    /**
     * upserts a value into the resource collection. In the absence of pre-existing config
     * or a config parameter assumes it is a value type
     */
    set(key, value, config) {
        if (!this.configs.has(key)) {
            if (!config) {
                return this.set(key, value, { type: 'value' });
            }
            if ((0, types_1.isResourceType)(config)) {
                return this.set(key, value, { type: config });
            }
            if (!(0, types_1.isResConfig)(config)) {
                throw new Error('cannot configure in set ');
            }
            this.configs.set(key, config);
        }
        else {
            config = this.configs.get(key);
        }
        if (config.final && this.resources.has(key)) {
            console.error('set: cannot set final ', key, 'from ', this.resources.get(key), 'to', value);
            throw new Error(`cannot set final entry ${key}`);
        }
        this.resEvents.next({ target: key, type: 'resource', value });
    }
    /**
     * A synchronous method that returns a value or an array of values
     * @param keys a key or an array of keys
     * @param alwaysArray {boolean} even if keys is not an array (a single key) return an array of values
     * @param map {ValueMap} a key-value pair of the current values (optional)
     */
    value(keys, alwaysArray = false, map) {
        if (!this.has(keys, map)) {
            return undefined;
        }
        const source = (map || this.values.value);
        // at this point we know the item / items in keys are ALL in the values
        if ((!Array.isArray(keys)) && (!alwaysArray)) {
            /**
             if a single item is being requested,
             and we don't demand an array response,
             return just that item, not in an array
             */
            return source.get(keys);
        }
        /**
         at this point we will return an array,
         as either alwaysArray is true
         or keys are an array
         */
        let list = Array.isArray(keys) ? keys : [keys];
        return list.map((key) => source.get(key));
    }
    /**
     * returns a function that wraps a call to the resource with
     * all possible prepended arguments from the configuration.
     *
     * We do not care at this point whether the function
     * is marked as async in the configuration.
     *
     * The metaFunction is _dynamic_ -- the resource and all its dependencies
     * are polled every time the method is called; no caching is done in closure.
     */
    metaFunction(key) {
        return (...params) => {
            var _a;
            const fn = this.resources.get(key);
            if (typeof fn !== 'function') {
                console.error('Cannot make computer out of ', key);
                throw new Error('non-functional key');
            }
            let args = [...params];
            const conf = this.configs.get(key);
            if (conf && Array.isArray(conf.args)) {
                args = [...conf.args, ...args];
            }
            if ((_a = conf === null || conf === void 0 ? void 0 : conf.deps) === null || _a === void 0 ? void 0 : _a.length) {
                args = [...this.value(conf.deps, true), ...args];
            }
            return fn(...args);
        };
    }
    // ---------- checks and streams -------------
    /**
     * return true if the key(s) requested are present in the CanDI's value.
     * (or, if presented, a Map);
     */
    has(keys, map) {
        if (!Array.isArray(keys)) {
            return this.has([keys]);
        }
        return keys.every((key) => (map || this.values.value).has(key));
    }
    /**
     * returns an observable that emits an array of values every time
     * the observed values change, once all the keys are present.
     * will emit once if they are already present.
     */
    when(keys, once = true) {
        const self = this;
        return this.values.pipe((0, rxjs_1.filter)((map) => self.has(keys, map)), // only emits if all keys are present
        (0, rxjs_1.map)((map) => self.value(keys, true, map)), // transforms  map (ValueMap) into ResourceValue[]
        (0, rxjs_1.distinctUntilChanged)(compareArrays), // only emits if one of the values has changed ( or the first time)
        (once ? (0, rxjs_1.tap)(() => {
        }) : (0, rxjs_1.first)()) // if once is true, only emits the first time the values are present
        );
    }
    // -------------- introspection ---------
    _config(key, prop, ifAbsent) {
        if (!this.configs.has(key)) {
            return undefined;
        }
        const config = this.configs.get(key);
        if (!(prop in config)) {
            if (ifAbsent instanceof Error) {
                throw ifAbsent;
            }
            return ifAbsent;
        }
        return config[prop];
    }
    typeof(key) {
        return this._config(key, 'type', new Error(`key ${key} is defined but of indeterminate type `));
    }
}
exports.CanDI = CanDI;
