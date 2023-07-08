export type ResourceType = 'value' | 'func' | 'comp';
export type ValueMap = Map<ResourceKey, any>;
export type ResourceKey = any;
export type ResourceValue = any;
export declare function isResourceType(arg: unknown): arg is ResourceType;
export type ResConfigKey = 'deps' | 'type' | 'args' | 'final' | 'computeOnce' | 'bind' | 'meta';
export type ResConfig = {
    deps?: ResourceKey[];
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
export type KeyArg = ResourceKey | ResourceKey[];
export type ResEventType = 'value' | 'init' | 'resource';
export type ResEventInit = {
    type: 'init';
    value: Resource;
};
export type ResEventResource = {
    type: 'resource';
    value: any;
};
export type ResEventValue = {
    type: 'value';
    value: any;
};
export type ResEvent = (ResEventInit | ResEventResource | ResEventValue) & {
    target: ResourceKey;
};
export type GenFunction = (...args: any[]) => any;
export type ResDef = {
    key: ResourceKey;
    value: any;
    config?: ResConfig;
    type?: ResourceType;
};
export type ResDefMutator = (def: ResDef) => ResDef;
export type PromiseQueueEvent = {
    key: ResourceKey;
    value: any;
};
export declare function isPromise(arg: any): arg is Promise<any>;
