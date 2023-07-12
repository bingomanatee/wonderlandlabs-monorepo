import { BehaviorSubject, Subject } from 'rxjs';
import { PromiseQueue } from './PromiseQueue';
import CanDIEntry from './CanDIEntry';
export type ResourceType = 'value' | 'func' | 'comp';
export type ValueMap = Map<Key, any>;
export type StreamMap = Map<Key, BehaviorSubject<any>>;
export type Key = any;
export type Value = any;
export declare function isResourceType(arg: unknown): arg is ResourceType;
export type ResConfigKey = 'deps' | 'type' | 'args' | 'final' | 'computeOnce' | 'bind' | 'meta';
export type Config = {
    deps?: Key[];
    type: ResourceType;
    args?: any[];
    final?: boolean;
    computeOnce?: boolean;
    async?: boolean;
    bind?: boolean;
    meta?: boolean;
};
export declare function isResConfig(config: unknown): config is Config;
export type Resource = {
    resource?: Value;
    config: Config;
};
export type KeyArg = Key | Key[];
export type ResEventType = 'value' | 'init' | 'resource' | 'values';
export type ResEventInit = {
    type: 'init';
    value: ResDef;
    target: Key;
};
export type ResEventResource = {
    type: 'resource';
    value: any;
    target: Key;
};
export type ResEventValue = {
    type: 'value';
    value: any;
    target: Key;
};
export type ResEventValues = {
    type: 'values';
    value: ValueMap;
};
export type ResEvent = (ResEventInit | ResEventResource | ResEventValue | ResEventValues);
export declare function isEventInit(arg: unknown): arg is ResEventInit;
export declare function isEventResource(arg: unknown): arg is ResEventResource;
export declare function isEventValue(arg: unknown): arg is ResEventValue;
export declare function isResEventValues(arg: unknown): arg is ResEventValues;
export type GenFunction = (...args: any[]) => any;
export type ResDef = {
    key: Key;
    value: any;
    config?: Config;
    type?: ResourceType;
};
export type ResDefMutator = (def: ResDef) => ResDef;
export type PromiseQueueEvent = {
    key: Key;
    value: any;
};
export declare function isPromise(arg: any): arg is Promise<any>;
export type CanDiType = {
    entries: Map<Key, CanDIEntry>;
    pq: PromiseQueue;
    get(key: Key): Value;
    gets(...keys: Key[]): Value[];
    events: Subject<ResEvent>;
    values: BehaviorSubject<ValueMap>;
    has(key: Key | Key[]): boolean;
    set(key: Key, value: Value): void;
    add(key: Key, value: Value, config?: Config): void;
};
