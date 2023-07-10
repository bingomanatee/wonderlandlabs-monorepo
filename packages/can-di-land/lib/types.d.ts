export type ResourceType = 'value' | 'func' | 'comp';
export type ValueMap = Map<Key, any>;
export type Key = any;
export type ResourceValue = any;
export declare function isResourceType(arg: unknown): arg is ResourceType;
export type ResConfigKey = 'deps' | 'type' | 'args' | 'final' | 'computeOnce' | 'bind' | 'meta';
export type ResConfig = {
    deps?: Key[];
    type: ResourceType;
    args?: any[];
    final?: boolean;
    computeOnce?: boolean;
    async?: boolean;
    bind?: boolean;
    meta?: boolean;
};
export declare function isResConfig(config: unknown): config is ResConfig;
export type Resource = {
    resource?: ResourceValue;
    config: ResConfig;
};
export type KeyArg = Key | Key[];
export type ResEventType = 'value' | 'init' | 'resource' | 'values';
export type ResEventInit = {
    type: 'init';
    value: Resource;
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
export declare function isResEventValue(arg: unknown): arg is ResEventValue;
export declare function isResEventValues(arg: unknown): arg is ResEventValues;
export type GenFunction = (...args: any[]) => any;
export type ResDef = {
    key: Key;
    value: any;
    config?: ResConfig;
    type?: ResourceType;
};
export type ResDefMutator = (def: ResDef) => ResDef;
export type PromiseQueueEvent = {
    key: Key;
    value: any;
};
export declare function isPromise(arg: any): arg is Promise<any>;
