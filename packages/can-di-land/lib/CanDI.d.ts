import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { KeyArg, ResConfig, ResDef, ResEvent, Resource, ResourceKey, ResourceValue, ValueMap } from './types';
/**
 * tracks resources added, with defined dependencies, an optional list of registry names.
 * note - resources are added immediately on the call of "set" -- however
 * if they have undefined dependencies, they are "pending"
 * -- their value will be undefined
 * until the dependencies are resolved.
 */
export declare class CanDI {
    configs: Map<any, ResConfig>;
    values: BehaviorSubject<ValueMap>;
    resources: Map<any, any>;
    resEvents: Subject<ResEvent>;
    constructor(values?: ResDef[]);
    private _resEventSub?;
    private _listenForEvents;
    private updateResource;
    protected _updateResource(key: ResourceKey, resource: any): void;
    /**
     * upserts a value into the values object.
     * We assume all safeguards have been checked
     * by the calling context.
     *
     * @param key
     * @param value
     */
    protected _setValue(key: ResourceKey, value: any): void;
    /**
     * upserts a value into the resource collection. In the absence of pre-existing config
     * or a config parameter assumes it is a value type
     */
    set(key: ResourceKey, value: ResourceValue, config?: ResConfig | string): void;
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
     * The metaFunction is _dynamic_ -- the resource and all its dependencies
     * are polled every time the method is called; no caching is done in closure.
     */
    private metaFunction;
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
    private _config;
    typeof(key: ResourceKey): any;
}
