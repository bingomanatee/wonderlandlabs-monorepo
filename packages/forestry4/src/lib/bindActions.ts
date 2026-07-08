import type { BoundStoreMethods, StoreMethod } from '../types';

const exclude = 'next,isActive,value,complete'.split(',');
type FnRecord = Record<string, StoreMethod>;
const requiredMethod = {
  get: 'get',
  set: 'set',
} as const;

function getAllMethodNames(obj: any): string[] {
  const methods = new Set<string>();

  // Walk up the prototype chain
  let current = obj;
  while (current && current !== Object.prototype) {
    // Get all property names (including non-enumerable)
    Object.getOwnPropertyNames(current).forEach((name) => {
      // Skip constructor and properties that might cause circular references
      if (name === 'constructor' || /^\$/.test(name)) return;

      // Check if it's a function by looking at the property descriptor
      const descriptor = Object.getOwnPropertyDescriptor(current, name);
      if (descriptor && typeof descriptor.value === 'function') {
        methods.add(name);
      }
    });
    current = Object.getPrototypeOf(current);
  }

  return Array.from(methods);
}

export default function bindActions<TTarget extends object>(
  target: TTarget,
): BoundStoreMethods<TTarget> {
  const methodNames = new Set([
    ...getAllMethodNames(target),
    ...Object.values(requiredMethod),
  ]);

  const callableTarget = target as Record<string, unknown>;

  return Array.from(methodNames).reduce(($: FnRecord, key: string) => {
    if (
      /^\$/.test(key) ||
      exclude.includes(key) ||
      typeof callableTarget[key] !== 'function'
    ) {
      return $;
    }

    const method = callableTarget[key] as StoreMethod;
    $[key] = (...args: any[]) => method.apply(target, args);
    return $;
  }, {}) as BoundStoreMethods<TTarget>;
}
