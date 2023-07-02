

export type ResourceType = 'value' | 'func' | 'comp';
export type ValueMap = Map<ResourceKey, any>;
export type ResourceKey = any; // this is more of a "documentation type" to indicate a value is a key to a resource
// than an actual type constraint
export type ResourceValue = any; // again - a semantic flag
const resourceTypes = ['value', 'func', 'comp'];
export function isResourceType(arg: unknown): arg is ResourceType {
  // @ts-ignore
  return resourceTypes.includes(arg);
}

export type ResConfig = {
  deps?: ResourceKey[],
  type: ResourceType,
  args?: any[],
  final?: boolean,
  computeOnce?: boolean,
  async?: boolean,
  bind?: boolean,
  meta?: boolean,
}

export function isResConfig(config: unknown) : config is ResConfig {
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

export type KeyArg = ResourceKey | ResourceKey[];
export type ResEventType = 'value' | 'init' | 'resource';

export type ResEventInit = {type: 'init', value: Resource };
export type ResEventResource = {type: 'resource', value: any};
export type ResEventValue = {type: 'value', value: any};
export type ResEvent = (ResEventInit | ResEventResource | ResEventValue) & {target: ResourceKey}

export type GenFunction = (...args: any[]) => any;
