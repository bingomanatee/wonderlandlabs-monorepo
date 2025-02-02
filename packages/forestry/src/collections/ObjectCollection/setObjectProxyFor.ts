export type ObjectSetInfo<KeyType extends keyof any, ValueType> = {
  object: Record<KeyType, ValueType>;
  key: KeyType;
  value: ValueType;
};

export function setObjectProxyFor<
  KeyType extends keyof any,
  ValueType = unknown,
>(target: ObjectSetInfo<KeyType, ValueType>) {
  const handler = {
    set() {
      throw new Error(
        'forest objects are immutable - cannot set any properties on objects',
      );
    },
    get(target: ObjectSetInfo<KeyType, ValueType>, method: KeyType) {
      if (method === target.key) {
        return target.value;
      }
      return target.object[method];
    },
    getOwnPropertyDescriptor(
      target: ObjectSetInfo<KeyType, ValueType>,
      method: KeyType,
    ) {
      if (method === target.key) {
        return {
          value: target.value,
          writable: false,
          enumerable: true,
          configurable: true,
        };
      }
      // Return the actual property descriptor
      const descriptor = Reflect.getOwnPropertyDescriptor(
        target.object,
        method,
      );

      if (descriptor) {
        descriptor.writable = false;
        descriptor.configurable = true; // Required for the spread operator
      }
      return descriptor;
    },
    ownKeys(target: ObjectSetInfo<KeyType, ValueType>) {
      const baseKeys = [...Reflect.ownKeys(target.object)];
      if (baseKeys.includes(target.key as string | symbol)) {
        return baseKeys;
      }
      return [...baseKeys, target.key];
    },
    deleteProperty(): boolean {
      throw new Error('forest objects are immutable - cannot delete keys');
    },
  };

  // @ts-expect-error 2345
  return new Proxy(target, handler) as Record<KeyType, ValueType>;
}
