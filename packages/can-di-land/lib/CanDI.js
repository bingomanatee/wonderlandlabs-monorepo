"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanDI = void 0;
const rxjs_1 = require("rxjs");
const types_1 = require("./types");
const PromiseQueue_1 = require("./PromiseQueue");
const utils_1 = require("./utils");
const DependencyAnalyzer_1 = require("./DependencyAnalyzer");
const collect_1 = require("@wonderlandlabs/collect");
/**
 * tracks resources added, with defined dependencies, an optional list of registry names.
 * note - resources are added immediately on the call of "set" -- however
 * if they have undefined dependencies, they are "pending"
 * -- their value will be undefined
 * until the dependencies are resolved.
 */
class CanDI {
    constructor(values) {
        /**
         * Resources are a somewhat redundant initial write of data from set and init calls.
         * They hold the functions used by 'comp' | 'func' types.
         * Their values are decorated with deps/args parameters
         * and either passed into the value collection below as a function (func).
         * or executed then their output is passed into the value collection.
         * This may be done indirectly through the promiseQueue for async entries.
         */
        this.resources = new Map();
        this.values = new rxjs_1.BehaviorSubject(new Map());
        this.configs = new Map();
        this.events = new rxjs_1.Subject();
        this.pq = new PromiseQueue_1.PromiseQueue();
        this._listenForEvents();
        values === null || values === void 0 ? void 0 : values.forEach((val) => {
            this._init(val);
            // would it be better to initialize the can's props "en masse"?
        });
    }
    _listenForEvents() {
        const self = this;
        this._resEventSub = this.events
            .pipe((0, rxjs_1.filter)(types_1.isEventInit))
            .subscribe((event) => {
            const { target, value } = event;
            self._initValue(target, value);
        });
        this._resEventResSub = this.events
            .pipe((0, rxjs_1.filter)(types_1.isEventResource))
            .subscribe((event) => {
            const { target, value } = event;
            self._upsertResource(target, value);
        });
        this._valEventResSub = this.events
            .pipe((0, rxjs_1.filter)(types_1.isResEventValue))
            .subscribe((event) => {
            const { target, value } = event;
            self._updateValue(target, value);
        });
        this._multiValSub = this.events
            .pipe((0, rxjs_1.filter)(types_1.isResEventValues))
            .subscribe((event) => {
            const { value } = event;
            this._updateValues(value);
        });
        this._pqSub = this.pq.events.subscribe(({ key, value }) => {
            self._setValue(key, value);
        });
    }
    // ----------------- initial values from constructor ------------
    _init(val) {
        let { config, key, type, value } = val;
        if (!config) {
            config = type ? { type } : { type: 'value' };
        }
        this.events.next({
            value: {
                // @ts-ignore
                resource: value,
                config
            }, target: key, type: 'init'
        });
    }
    _initValue(target, value) {
        const { config } = value;
        if (this.configs.has(target)) {
            console.error('cannot re-configure ', target, 'for', target, 'with', event);
            return;
        }
        // first write of config for key
        this.configs.set(target, this._interpretKeyConfig(target, config));
        // initialize the data upsert
        if ('resource' in value) {
            this.events.next({ type: 'resource', target: target, value: value.resource });
        }
    }
    /**
     * This is the initial action triggered by `set(key, value)`.
     */
    _upsertResource(key, resource) {
        var _a;
        const config = this.configs.get(key);
        if (!config) {
            console.error('un-configured resource:', key, 'set to ', resource);
            return;
        }
        if (config.final && this.resources.has(key)) {
            console.warn('attempt to re-define a final key ', key);
            return;
        }
        this.resources.set(key, resource);
        switch (config.type) {
            case 'value':
                if (config.async) {
                    this.pq.set(key, resource);
                }
                else {
                    this._setValue(key, resource);
                }
                break;
            case 'comp':
                if (((_a = config.deps) === null || _a === void 0 ? void 0 : _a.length) && !this.has(config.deps)) {
                    /*
                     do nothing - pending all dependencies.
                     Note - setting the resource for a pending value but NOT updating the values stream
                     is an _intended_ possibility
                    */
                }
                else if (config.async) {
                    this.pq.set(key, this.resAsFunction(key)());
                }
                else {
                    this._setValue(key, this.resAsFunction(key)()); // sets the _value_ of the resAsFunction
                }
                break;
            case 'func':
                this._setValue(key, this.resAsFunction(key)); // sets the resAsFunction itself
                break;
            default:
                console.warn('bad type for key ', key, ':', config.type);
        }
    }
    /**
     * this method _requests_ a value update. Dpennding on configs, it may or may not compete.
     *
     * @param key
     * @param value
     */
    _setValue(key, value) {
        this.events.next({ type: 'value', value, target: key });
    }
    // ------------------------- Update Methods ---------------------
    /**
     * These methods are the final write methods for updating the value stream.
     * It is assumed that upstream of calling them, the resource has been updated.
     */
    _updateValue(key, value) {
        this._updateValues(new Map([[key, value]]));
    }
    _updateValues(values) {
        values.forEach((value, key) => {
            if (this._finalized(key)) {
                values.delete(key);
            }
        });
        if (!values.size) {
            return;
        }
        const next = this.resolveDeps(values); // update any comps based on new deps values.
        this.values.next(next);
    }
    /**
     * this is a prep method for updating many values.
     * The comp entries are called in a specific order to minimize dependency sync errors.
     * @param values
     */
    resolveDeps(values) {
        const currentValues = (0, utils_1.mergeMap)(this.values.value, values);
        const depper = new DependencyAnalyzer_1.DependencyAnalyzer(this);
        depper.updateComputed(currentValues, values);
        return currentValues;
    }
    // ------------------------- IO methods ------------------------
    /**
     * upserts a value into the resource collection. In the absence of pre-existing config
     * or a config parameter assumes it is a value type
     */
    set(key, value, config) {
        if (!this.configs.has(key)) {
            config = this._interpretKeyConfig(key, config);
            this.events.next({
                type: 'init',
                target: key,
                value: {
                    config,
                    resource: value
                }
            });
        }
        else {
            const config = this.configs.get(key);
            if (config.final && this.resources.has(key)) {
                // console.error('set: cannot set final ', key, 'from ', this.resources.get(key), 'to', value);
                throw new Error(`cannot set final entry ${key}`);
            }
            this.events.next({ target: key, type: 'resource', value });
        }
    }
    /*  /!**
       * Values are a set of concrete values -- either of value type of conf results.
       * All async must be resolved, and it is assumed finality was checked by the caller.
       * @param values
       *!/
      setMany(values: ValueMap) {
        let resMap: ValueMap | undefined;
        let valueMap: ValueMap | undefined;
  
        values.forEach((value, key) => {
          switch (this.keyType(key)) {
            case 'value':
              if (!resMap) {
                resMap = new Map(this.resources);
              }
              if (!valueMap) {
                valueMap = new Map(this.values.value);
              }
  
              resMap.set(key, value);
              valueMap.set(key, value);
              break;
  
            case 'func':
              // only needs to be set once
              if (!this.values.value.has(key)) {
                if (!valueMap) {
                  valueMap = new Map(this.values.value);
                }
                valueMap.set(key, this.resAsFunction(key))
              }
              break;
  
            case 'comp':
              if (!valueMap) {
                valueMap = new Map(this.values.value);
              }
  
              valueMap.set(key, value);
              break
          }
        });
        if (resMap) {
          this.resources = mergeMap(this.resources, resMap);
        }
  
        if (valueMap) {
          this._updateValues(valueMap);
        }
      }*/
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
        return (0, utils_1.asArray)(keys).map((key) => source.get(key));
    }
    /**
     * returns a function that wraps a call to the resource with
     * all possible prepended arguments from the configuration.
     *
     * We do not care at this point whether the function
     * is marked as async in the configuration.
     *
     * The resAsFunction is _dynamic_ -- the resource and all its dependencies
     * are polled every time the method is called; no caching is done in closure.
     *
     * Because there are times when the driving dependent array is in flux it is an optional argument.
     * In its absence, the class' values subject value is used (downstream).
     */
    resAsFunction(key, values) {
        const self = this;
        return (...params) => {
            const fn = self.resources.get(key);
            if (typeof fn !== 'function') {
                console.error('Cannot make computer out of ', key);
                throw new Error('non-functional key');
            }
            let fnParams = params;
            let prepend = (args) => {
                if (Array.isArray(args) && args.length) {
                    fnParams = [...args, ...fnParams];
                }
            };
            const conf = self.configs.get(key);
            if (!conf) {
                console.error('attempt to compute a function without a comp', key);
                return undefined;
            }
            const { args, deps } = conf;
            prepend(args);
            if (deps === null || deps === void 0 ? void 0 : deps.length) {
                if (!self.has(deps, values)) {
                    console.error('attempt to call resAsFunction with pending deps:', key, conf, 'current value keys: ', Array.from(this.values.value.keys()));
                    return undefined;
                }
                let depValues;
                depValues = self.value(deps, true, values);
                prepend(depValues);
            }
            return fn(...fnParams);
        };
    }
    // ---------- checks and streams -------------
    /**
     * return true if the key(s) requested are present in the CanDI's value.
     * (or, if presented, a Map);
     */
    has(keys, map) {
        const subject = (map || this.values.value);
        if (!Array.isArray(keys)) {
            return subject.has(keys);
        }
        return keys.every((key) => subject.has(key));
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
        (0, rxjs_1.distinctUntilChanged)(utils_1.compareArrays), // only emits if one of the values has changed ( or the first time)
        (once ? (0, rxjs_1.tap)(() => {
        }) : (0, rxjs_1.first)()) // if once is true, only emits the first time the values are present
        );
    }
    // -------------- introspection ---------
    _finalized(key) {
        var _a;
        return !!((_a = this.configs.get(key)) === null || _a === void 0 ? void 0 : _a.final) && this.has(key);
    }
    /**
     * returns a specific property of a resources' config.
     * If there is no config it will return undefined --ignoring isAbsent.
     * If there is a config BUT it has no EXPLICIT property definition for the requested property,
     * it returns ifAbsent (or throws it if it is an error).
     */
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
    keyType(key) {
        return this._config(key, 'type', new Error(`key ${key} is defined but of indeterminate type `));
    }
    _interpretKeyConfig(key, config) {
        var _a;
        if (this.configs.has(key)) {
            config = this.configs.get(key);
        }
        if (!config) {
            config = { type: 'value' };
        }
        else if ((0, types_1.isResourceType)(config)) {
            config = { type: config };
        }
        if (!(0, types_1.isResConfig)(config)) {
            throw new Error('cannot configure in set ');
        }
        if (config.type === 'value' && ((_a = config.deps) === null || _a === void 0 ? void 0 : _a.length)) {
            console.error('bad value config -- no deps allowed', key, config);
            throw new Error('cannot add dependencies to value configs');
        }
        return config;
    }
    /*  _checkDeps(key: Key) {
        const depNode = new DependencyAnalyzer(key, this);
        const errors = depNode.errors;
        if (errors.length) {
          console.error('dependency errors:', errors);
          throw errors;
        }
        ;
      }
  
      _updateDeps(key: Key) {
        const updateMap = new Map();
        const promiseMap = new Map();
        this.configs.forEach((config: ResConfig, configKey) => {
          if (config.final && this.has(configKey)) {
            return;
            // lock in any finalized value
          }
          if (!config.deps?.includes(key)) {
            return;
          }
          // other dependencies are missing;
          if (!this.has(config.deps)) {
            return;
          }
  
          switch (config.type) {
            case 'func':
              if (!this.values.value.has(configKey)) {
                updateMap.set(configKey, this.resAsFunction(configKey));
              }
              break;
  
            case 'comp':
              if (config.async) {
                promiseMap.set(configKey, this.resAsFunction(configKey)())
              } else {
                updateMap.set(configKey, this.resAsFunction(configKey)());
              }
              break;
          }
  
          if (updateMap.size) {
            this.events.next({ type: 'values', value: updateMap })
          }
          if (promiseMap.size) {
            let resolvers: GenFunction[] = [];
            promiseMap.forEach((promise, key) => {
              resolvers.push(async () => {
                let value = await (promise);
                promiseMap.set(key, value);
              })
            });
            Promise.all(resolvers)
              .then((result) => {
                this.events.next({ type: 'values', value: promiseMap })
              })
              .catch(err => {
                console.error('error resolving deps:', err, promiseMap);
                throw err;
              });
          }
        })
      }*/
    /**
     * returns a map of values, keyed by the comp that depends on them.
     * @param values
     * @param includeFinals
     */
    compDeps(values, includeFinals = false) {
        if (!values) {
            values = this.values.value;
        }
        return (0, collect_1.c)(this.configs)
            .getReduce((list, config, key) => {
            const { deps, type, final } = config;
            if (type !== 'comp' || (!(deps === null || deps === void 0 ? void 0 : deps.length))) {
                return list;
            }
            if (final && (values === null || values === void 0 ? void 0 : values.has(key)) && (!includeFinals)) {
                return list;
            }
            if (deps.every((depKey) => values === null || values === void 0 ? void 0 : values.has(depKey))) {
                return list;
            }
            list.set(key, deps.map((depKey) => values === null || values === void 0 ? void 0 : values.get(depKey)));
            return list;
        }, new Map());
    }
}
exports.CanDI = CanDI;
