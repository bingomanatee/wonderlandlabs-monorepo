import { BehaviorSubject, Subject } from 'rxjs'
import { PromiseQueue } from './PromiseQueue'
import CanDIEntry from './CanDIEntry'

export type ResourceType = 'value' | 'func' | 'comp';
export type ValueMap = Map<Key, any>;
export type StreamMap = Map<Key, BehaviorSubject<any>>
export type Key = any; // this is more of a "documentation type" to indicate a value is a key to a resource
// than an actual type constraint
export type Value = any; // again - a semantic flag
const resourceTypes = ['value', 'func', 'comp'];

export function isResourceType(arg: unknown): arg is ResourceType {
  // @ts-ignore
  return resourceTypes.includes(arg);
}

export type ResConfigKey = 'deps' | 'type' | 'args' | 'final' | 'bind' | 'meta'
export type Config = {
  deps?: Key[],
  type: ResourceType,
  args?: any[],
  final?: boolean,
  async?: boolean, // indicates that it is a value that must be resolved, such as a REST call.
  bind?: boolean, // bind the function to the CanDI instance; if true, meta must be true as well
  meta?: boolean // is a function that returns a value - perhaps because it needs a closure; not currently fully implemented
}

export function isResConfig(config: unknown): config is Config {
  if (!(config && typeof config === 'object')) {
    return false;
  }
  // @ts-ignore
  if (!config && isResourceType(config.type)) {
    return false;
  }
  return !['final', 'async'].some((param: string) => (
    // @ts-ignore
    (param in config) && (typeof config[param] !== 'boolean')
  ));
}

export type Resource = {
  resource?: Value,
  config: Config,
}

export type KeyArg = Key | Key[];
export type ResEventType = 'value' | 'init' | 'resource' | 'values';

export type ResEventInit = { type: 'init', value: ResDef, target: Key  };
export type ResEventResource = { type: 'resource', value: any, target: Key  };
export type ResEventValue = { type: 'value', value: any, target: Key };
export type ResEventValues = { type: 'values', value: ValueMap };
export type ResEventError = {type: 'async-error', target: Key, value: any}
export type ResEvent = (ResEventInit | ResEventResource | ResEventValue | ResEventValues | ResEventError)

export function isEventInit(arg: unknown) : arg is ResEventInit {
  return !!(arg && typeof arg === 'object' && 'type' in arg && arg.type === 'init' && 'value' in arg && 'target' in arg)
}

export function isEventError(arg: unknown) : arg is ResEventError {
  return !!(arg && typeof arg === 'object' && 'type' in arg && arg.type === 'async-error' && 'value' in arg && 'target' in arg)

}
export function isEventResource(arg: unknown): arg is ResEventResource {
  return !!(arg && typeof arg === 'object' && 'type' in arg && arg.type === 'resource' && 'value' in arg && 'target' in arg)
}

export function isEventValue(arg: unknown): arg is ResEventValue {
  return !!(arg && typeof arg === 'object' && 'type' in arg && arg.type === 'value' && 'value' in arg && 'target' in arg)
}

export function isResEventValues(arg: unknown): arg is ResEventValues {
  return !!(arg && typeof arg === 'object' && 'type' in arg && arg.type === 'values' && 'value' in arg)
}

export type GenFunction = (...args: any[]) => any;
export type ResDef = { key: Key, value: any, config?: Config, type?: ResourceType }
export type ResDefMutator = (def: ResDef) => ResDef;
type PromiseQueueMessage = {
  key: Key,
  value: any
}

type PromiseQueueError = {
  key: Key, error: any
}

export function isPromiseQueueMessage(arg: any) : arg is PromiseQueueMessage {
  return !!(arg && typeof arg === 'object' && 'key' in arg && 'value' in arg)
}
export type PromiseQueueEvent = PromiseQueueMessage | PromiseQueueError

export function isPromise(arg: any): arg is Promise<any> {
  return (!!(arg && typeof arg == 'object' && ('then' in arg) && typeof arg.then === 'function'))
}

export type CanDiType = {
  entries: Map<Key, CanDIEntry>,
  pq: PromiseQueue,
  get(key: Key) : Value
  gets(...keys: Key[]): Value[]
  events: Subject<ResEvent>;
  values: BehaviorSubject<ValueMap>;
  has(key: Key | Key[]) : boolean;
  set(key: Key, value: Value) : void;
  add(key: Key, value: Value, config?: Config) : void
}
