import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { KeyArg, ResConfig, ResDef, ResEvent, Resource, Key, ResourceValue, ValueMap } from './types';
import { PromiseQueue } from './PromiseQueue';
/**
 * tracks resources added, with defined dependencies, an optional list of registry names.
 * note - resources are added immediately on the call of "set" -- however
 * if they have undefined dependencies, they are "pending"
 * -- their value will be undefined
 * until the dependencies are resolved.
 */
export declare class CanDI {
    constructor(values?: ResDef[]);
    /**
     * Resources are a somewhat redundant initial write of data from set and init calls.
     * They hold the functions used by 'comp' | 'func' types.
     * Their values are decorated with deps/args parameters
     * and either passed into the value collection below as a function (func).
     * or executed then their output is passed into the value collection.
     * This may be done indirectly through the promiseQueue for async entries.
     */
    resources: ValueMap;
    values: BehaviorSubject<ValueMap>;
    configs: Map<any, ResConfig>;
    events: Subject<ResEvent>;
    pq: PromiseQueue;
    private _resEventResSub?;
    private _valEventResSub?;
    private _multiValSub?;
    private _resEventSub?;
    private _pqSub?;
    private _listenForEvents;
    private _init;
    private _initValue;
    /**
     * This is the initial action triggered by `set(key, value)`.
     */
    private _upsertResource;
    /**
     * this method _requests_ a value update. Dpennding on configs, it may or may not compete.
     *
     * @param key
     * @param value
     */
    protected _setValue(key: Key, value: any): void;
    /**
     * These methods are the final write methods for updating the value stream.
     * It is assumed that upstream of calling them, the resource has been updated.
     */
    protected _updateValue(key: Key, value: ResourceValue): void;
    protected _updateValues(values: ValueMap): void;
    /**
     * this is a prep method for updating many values.
     * The comp entries are called in a specific order to minimize dependency sync errors.
     * @param values
     */
    resolveDeps(values: ValueMap): Map<any, any>;
    /**
     * upserts a value into the resource collection. In the absence of pre-existing config
     * or a config parameter assumes it is a value type
     */
    set(key: Key, value: ResourceValue, config?: ResConfig | string): void;
    /**
     * A synchronous method that returns a value or an array of values
     * @param keys a key or an array of keys
     * @param alwaysArray {boolean} even if keys is not an array (a single key) return an array of values
     * @param map {ValueMap} a key-value pair of the current values (optional)
     */
    value(keys: KeyArg, alwaysArray?: boolean, map?: ValueMap): ResourceValue | ResourceValue[] | undefined;
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
    resAsFunction(key: Key, values?: ValueMap): (...params: any) => any;
    /**
     * return true if the key(s) requested are present in the CanDI's value.
     * (or, if presented, a Map);
     */
    has(keys: KeyArg, map?: ValueMap): boolean;
    /**
     * returns an observable that emits an array of values every time
     * the observed values change, once all the keys are present.
     * will emit once if they are already present.
     */
    when(keys: KeyArg, once?: boolean): Observable<Resource[]>;
    protected _finalized(key: Key): boolean;
    /**
     * returns a specific property of a resources' config.
     * If there is no config it will return undefined --ignoring isAbsent.
     * If there is a config BUT it has no EXPLICIT property definition for the requested property,
     * it returns ifAbsent (or throws it if it is an error).
     */
    private _config;
    keyType(key: Key): any;
    private _interpretKeyConfig;
    /**
     * returns a map of values, keyed by the comp that depends on them.
     * @param values
     * @param includeFinals
     */
    compDeps(values?: ValueMap, includeFinals?: boolean): any;
}
