export type ResourceType = 'value' | 'func' | 'comp';
export type ValueMap = Map<Key, any>;
export type Key = any; // this is more of a "documentation type" to indicate a value is a key to a resource
// than an actual type constraint
export type ResourceValue = any; // again - a semantic flag
const resourceTypes = ['value', 'func', 'comp'];

export function isResourceType(arg: unknown): arg is ResourceType {
  // @ts-ignore
  return resourceTypes.includes(arg);
}

export type ResConfigKey = 'deps' | 'type' | 'args' | 'final' | 'computeOnce' | 'bind' | 'meta'
export type ResConfig = {
  deps?: Key[],
  type: ResourceType,
  args?: any[],
  final?: boolean,
  computeOnce?: boolean, // indicates that the 'comp' resource function can only be called once. Ignored by other resource types.
  async?: boolean, // indicates that it is a value that must be resolved, such as a REST call.
  bind?: boolean, // bind the function to the CanDI instance; if true, meta must be true as well
  meta?: boolean // is a function that returns a value - perhaps because it needs a closure; not currently fully implemented
}

export function isResConfig(config: unknown): config is ResConfig {
  if (!(config && typeof config === 'object')) {
    return false;
  }
  // @ts-ignore
  if (!config && isResourceType(config.type)) {
    return false;
  }
  return !['final', 'computeOnce', 'async', 'bind', 'meta'].some((param: string) => (
    // @ts-ignore
    (param in config) && (typeof config[param] !== 'boolean')
  ));
}

export type Resource = {
  resource?: ResourceValue,
  config: ResConfig,
}

export type KeyArg = Key | Key[];
export type ResEventType = 'value' | 'init' | 'resource' | 'values';

export type ResEventInit = { type: 'init', value: Resource, target: Key  };
export type ResEventResource = { type: 'resource', value: any, target: Key  };
export type ResEventValue = { type: 'value', value: any, target: Key };
export type ResEventValues = { type: 'values', value: ValueMap }
export type ResEvent = (ResEventInit | ResEventResource | ResEventValue | ResEventValues)

export function isEventInit(arg: unknown) : arg is ResEventInit {
  return !!(arg && typeof arg === 'object' && 'type' in arg && arg.type === 'init' && 'value' in arg && 'target' in arg)
}

export function isEventResource(arg: unknown): arg is ResEventResource {
  return !!(arg && typeof arg === 'object' && 'type' in arg && arg.type === 'resource' && 'value' in arg && 'target' in arg)
}

export function isResEventValue(arg: unknown): arg is ResEventValue {
  return !!(arg && typeof arg === 'object' && 'type' in arg && arg.type === 'value' && 'value' in arg && 'target' in arg)
}

export function isResEventValues(arg: unknown): arg is ResEventValues {
  return !!(arg && typeof arg === 'object' && 'type' in arg && arg.type === 'values' && 'value' in arg)
}

export type GenFunction = (...args: any[]) => any;
export type ResDef = { key: Key, value: any, config?: ResConfig, type?: ResourceType }
export type ResDefMutator = (def: ResDef) => ResDef;
export type PromiseQueueEvent = {
  key: Key,
  value: any
}

export function isPromise(arg: any): arg is Promise<any> {
  return (!!(arg && typeof arg == 'object' && ('then' in arg) && typeof arg.then === 'function'))
}
