import {
  BehaviorSubject, combineLatest,
  distinctUntilChanged,
  filter,
  first,
  map,
  Observable,
  Subject,
  Subscription,
  tap,
} from 'rxjs'
import {
  GenFunction, isEventInit, isEventResource,
  isResConfig, isResEventValue, isResEventValues,
  isResourceType,
  KeyArg,
  ResConfig,
  ResConfigKey,
  ResDef,
  ResEvent,
  Resource,
  Key,
  ResourceValue,
  ValueMap
} from './types';
import { PromiseQueue } from './PromiseQueue'
import { asArray, compareArrays, mergeMap } from './utils'
import { DependencyAnalyzer } from './DependencyAnalyzer'
import { c } from '@wonderlandlabs/collect'

/**
 * tracks resources added, with defined dependencies, an optional list of registry names.
 * note - resources are added immediately on the call of "set" -- however
 * if they have undefined dependencies, they are "pending"
 * -- their value will be undefined
 * until the dependencies are resolved.
 */
export class CanDI {

  constructor(values?: ResDef[]) {
    this._listenForEvents();
    values?.forEach((val) => {
      this._init(val);
      // would it be better to initialize the can's props "en masse"?
    });
  }


  /**
   * Resources are a somewhat redundant initial write of data from set and init calls.
   * They hold the functions used by 'comp' | 'func' types.
   * Their values are decorated with deps/args parameters
   * and either passed into the value collection below as a function (func).
   * or executed then their output is passed into the value collection.
   * This may be done indirectly through the promiseQueue for async entries.
   */
  public resources: ValueMap = new Map<Key, any>();
  public values = new BehaviorSubject<ValueMap>(new Map())
  public configs = new Map<Key, ResConfig>();
  public events = new Subject<ResEvent>();
  public pq = new PromiseQueue();

// ---------------- initial observer for events ----------

  private _resEventResSub?: Subscription;
  private _valEventResSub?: Subscription
  private _multiValSub?: Subscription
  private _resEventSub?: Subscription;
  private _pqSub?: Subscription;

  private _listenForEvents() {
    const self = this;

    this._resEventSub = this.events
      .pipe(
        filter(isEventInit)
      )
      .subscribe((event) => {
        const { target, value } = event;
        self._initValue(target, value);
      });

    this._resEventResSub = this.events
      .pipe(
        filter(isEventResource)
      )
      .subscribe(
        (event) => {
          const { target, value } = event;
          self._upsertResource(target, value);
        });

    this._valEventResSub = this.events
      .pipe(
        filter(isResEventValue)
      )
      .subscribe(
        (event) => {
          const { target, value } = event;
          self._updateValue(target, value);
        });

    this._multiValSub = this.events
      .pipe(
        filter(isResEventValues)
      )
      .subscribe((event) => {
        const { value } = event;
        this._updateValues(value);
      })
    this._pqSub = this.pq.events.subscribe(({ key, value }) => {
      self._setValue(key, value);
    })
  }

  // ----------------- initial values from constructor ------------

  private _init(val: ResDef) {
    let { config, key, type, value } = val;
    if (!config) {
      config = type ? { type } : { type: 'value' }
    }
    this.events.next({
      value: {
        // @ts-ignore
        resource: value,
        config
      }, target: key, type: 'init'
    })
  }

  private _initValue(target: Key, value: Resource) {
    const { config } = value;
    if (this.configs.has(target)) {
      console.error('cannot re-configure ', target, 'for', target, 'with', event);
      return;
    }
    // first write of config for key
    this.configs.set(target, this._interpretKeyConfig(target, config));
    // initialize the data upsert
    if ('resource' in value) {
      this.events.next({ type: 'resource', target: target, value: value.resource })
    }
  }

  /**
   * This is the initial action triggered by `set(key, value)`.
   */
  private _upsertResource(key: Key, resource: any) {
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
        } else {
          this._setValue(key, resource);
        }
        break;

      case 'comp':
        if (config.deps?.length && !this.has(config.deps)) {
          /*
           do nothing - pending all dependencies.
           Note - setting the resource for a pending value but NOT updating the values stream
           is an _intended_ possibility
          */
        } else if (config.async) {
          this.pq.set(key, this.resAsFunction(key)());
        } else {
          this._setValue(key, this.resAsFunction(key)()); // sets the _value_ of the resAsFunction
        }
        break;
      case 'func':
        this._setValue(key, this.resAsFunction(key)); // sets the resAsFunction itself
        break;

      default:
        console.warn('bad type for key ', key, ':', config.type)
    }
  }

  /**
   * this method _requests_ a value update. Dpennding on configs, it may or may not compete.
   *
   * @param key
   * @param value
   */
  protected _setValue(key: Key, value: any) {
    this.events.next({ type: 'value', value, target: key })
  }

  // ------------------------- Update Methods ---------------------
  /**
   * These methods are the final write methods for updating the value stream.
   * It is assumed that upstream of calling them, the resource has been updated.
   */
  protected _updateValue(key: Key, value: ResourceValue) {
    this._updateValues(new Map([[key, value]]))
  }

  protected _updateValues(values: ValueMap) {
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
  resolveDeps(values: ValueMap) {
    const currentValues = mergeMap(this.values.value, values);
    const depper = new DependencyAnalyzer(this);
    depper.updateComputed(currentValues, values);
    return currentValues;
  }

  // ------------------------- IO methods ------------------------

  /**
   * upserts a value into the resource collection. In the absence of pre-existing config
   * or a config parameter assumes it is a value type
   */
  set(key: Key, value: ResourceValue, config?: ResConfig | string): void {
    if (!this.configs.has(key)) {
      config = this._interpretKeyConfig(key, config);
      this.events.next({
        type: 'init',
        target: key,
        value: {
          config,
          resource: value
        }
      })
    } else {
      const config = this.configs.get(key)!;
      if (config.final && this.resources.has(key)) {
        // console.error('set: cannot set final ', key, 'from ', this.resources.get(key), 'to', value);
        throw new Error(`cannot set final entry ${key}`);
      }
      this.events.next({ target: key, type: 'resource', value })
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
  public value(keys: KeyArg, alwaysArray = false, map?: ValueMap): ResourceValue | ResourceValue[] | undefined {
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
    return asArray(keys).map((key: Key) => source.get(key));
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
  public resAsFunction(key: Key, values ?: ValueMap): (...params: any) => any {
    const self = this;
    return (...params) => {
      const fn = self.resources.get(key);
      if (typeof fn !== 'function') {
        console.error('Cannot make computer out of ', key);
        throw new Error('non-functional key');
      }
      let fnParams = params;
      let prepend = (args: any[] | undefined) => {
        if (Array.isArray(args) && args.length) {
          fnParams = [...args, ...fnParams];
        }
      }
      const conf = self.configs.get(key);
      if (!conf) {
        console.error('attempt to compute a function without a comp', key);
        return undefined;
      }
      const { args, deps } = conf;
      prepend(args);

      if (deps?.length) {
        if (!self.has(deps, values)) {
          console.error('attempt to call resAsFunction with pending deps:', key, conf, 'current value keys: ', Array.from(this.values.value.keys()));
          return undefined;
        }

        let depValues;
        depValues = self.value(deps, true, values);
        prepend(depValues);
      }

      return fn(...fnParams);
    }
  }

  // ---------- checks and streams -------------

  /**
   * return true if the key(s) requested are present in the CanDI's value.
   * (or, if presented, a Map);
   */
  public has(keys: KeyArg, map?: ValueMap): boolean {
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
  when(keys: KeyArg, once = true): Observable<Resource[]> {
    const self = this;
    return this.values.pipe(
      filter((map) => self.has(keys, map)), // only emits if all keys are present
      map((map) => self.value(keys, true, map)), // transforms  map (ValueMap) into ResourceValue[]
      distinctUntilChanged(compareArrays), // only emits if one of the values has changed ( or the first time)
      (once ? tap(() => {
      }) : first()) // if once is true, only emits the first time the values are present
    );
  }

  // -------------- introspection ---------
  protected _finalized(key: Key) {
    return !!this.configs.get(key)?.final && this.has(key);
  }

  /**
   * returns a specific property of a resources' config.
   * If there is no config it will return undefined --ignoring isAbsent.
   * If there is a config BUT it has no EXPLICIT property definition for the requested property,
   * it returns ifAbsent (or throws it if it is an error).
   */
  private _config(key: Key, prop: ResConfigKey, ifAbsent?: any): any | undefined {
    if (!this.configs.has(key)) {
      return undefined;
    }
    const config = this.configs.get(key)!;
    if (!(prop in config)) {
      if (ifAbsent instanceof Error) {
        throw ifAbsent;
      }
      return ifAbsent;
    }
    return config[prop];
  }

  keyType(key: Key) {
    return this._config(key, 'type', new Error(`key ${key} is defined but of indeterminate type `));
  }

  private _interpretKeyConfig(key: Key, config: ResConfig | string | undefined) {
    if (this.configs.has(key)) {
      config = this.configs.get(key)!;
    }
    if (!config) {
      config = { type: 'value' };
    } else if (isResourceType(config)) {
      config = { type: config };
    }
    if (!isResConfig(config)) {
      throw new Error('cannot configure in set ');
    }
    if (config.type === 'value' && config.deps?.length) {
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
  public compDeps(values?: ValueMap, includeFinals = false) {
    if (!values) {
      values = this.values.value;
    }

    return c(this.configs)
      .getReduce((list, config, key) => {

        const { deps, type, final } = config;
        if (type !== 'comp' || (!deps?.length)) {
          return list;
        }
        if (final && values?.has(key) && (!includeFinals)) {
          return list;
        }

        if (deps.every((depKey: Key) => values?.has(depKey))) {
          return list;
        }

        list.set(key, deps.map((depKey: Key) => values?.get(depKey)));

        return list;
      }, new Map())
  }
}
