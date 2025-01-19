export type ObjectPatchInfo<KeyType extends keyof any, ValueType> = {
  object: Record<KeyType, ValueType>;
  patch: Record<KeyType, ValueType>;
};

export function patchObjectProxyFor<
  KeyType extends keyof any,
  ValueType = unknown,
>(target: ObjectPatchInfo<KeyType, ValueType>) {
  const handler = {
    set() {
      throw new Error(
        'forest objects are immutable - cannot set any properties on objects',
      );
    },
    get(target: ObjectPatchInfo<KeyType, ValueType>, key: KeyType) {
      if (key in target.patch) {
        return target.patch[key];
      }
      return target.object[key];
    },
    getOwnPropertyDescriptor(
      target: ObjectPatchInfo<KeyType, ValueType>,
      key: KeyType,
    ) {
      if (key in target.patch) {
        return {
          value: target.patch[key],
          writable: false,
          enumerable: true,
          configurable: true,
        };
      }
      // Return the actual property descriptor
      const descriptor = Reflect.getOwnPropertyDescriptor(target.object, key);

      if (descriptor) {
        descriptor.writable = false;
        descriptor.configurable = true; // Required for the spread operator
      }
      return descriptor;
    },
    ownKeys(target: ObjectPatchInfo<KeyType, ValueType>) {
      return Array.from(
        new Set([
          ...Array.from(Object.keys(target.object)),
          ...Array.from(Object.keys(target.patch)),
        ]).values(),
      );
    },
    deleteProperty(): boolean {
      throw new Error('forest objects are immutable - cannot delete keys');
    },
  };

  // @ts-expect-error 2345
  return new Proxy(target, handler) as Record<KeyType, ValueType>;
}
