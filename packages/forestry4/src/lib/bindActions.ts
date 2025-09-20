const exclude = 'next,isActive,value,complete'.split(',');
export type FnRecord = Record<string, () => void>;

function getAllMethodNames(obj: any): string[] {
  const methods = new Set<string>();

  // Walk up the prototype chain
  let current = obj;
  while (current && current !== Object.prototype) {
    // Get all property names (including non-enumerable)
    Object.getOwnPropertyNames(current).forEach(name => {
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

export default function bindActions(target: FnRecord) {
  const methodNames = getAllMethodNames(target);

  return methodNames.reduce(($: FnRecord, key: string) => {
    if (/^\$/.test(key) || exclude.includes(key) || typeof target[key] !== 'function') {
      return $;
    }

    $[key] = (...args: unknown[]) => (target[key] as Function).apply(target, args);
    return $;
  }, {});
}
