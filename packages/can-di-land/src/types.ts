

export type ResourceType = 'value' | 'func' | 'action' | 'comp';

export type ResourceKey = any; // this is more of a "documentation type" to indicate a value is a key to a resource
// than an actual type constraint
export type ResConfig = {
  deps?: ResourceKey[],
  type: ResourceType,
  args?: any[],
  final?: boolean,
  computeOnce?: boolean,
  async?: boolean
}

export type Resource = {
  resource: any,
  value?: any,
  config: ResConfig,
  pending?: boolean,
}

export type GenFunction = (...args: any[]) => any;
