export type ObjectSetInfo<KeyType extends keyof any, ValueType> = {
  object: Record<KeyType, ValueType>;
  key: KeyType;
  value: ValueType;
};

/*

import type { IterFn } from './../../types/types.shared';
import { noSet } from './ObjectCollection';

function makeIterator<KeyType extends keyof any, ValueType>(
  target: ObjectSetInfo<KeyType, ValueType>,
) {
  const { object, key, value } = target;
  return function* () {
    for (const list of map) {
      yield list;
    }
    yield [key, value];
  };
}

function makeValueIterator<KeyType, ValueType>(
  target: ObjectSetInfo<KeyType, ValueType>,
) {
  const { object, key, value } = target;
  return () => ({
    // because one of the key may be redundant
    // we have to iterate over keys to find and skip it
    [Symbol.iterator]: function* () {
      for (const k of map.keys()) {
        if (k !== key) {
          yield map.get(k);
        }
      }
      yield value;
    },
  });
}
function makeEntriesIterator<KeyType, ValueType>(
  target: ObjectSetInfo<KeyType, ValueType>,
) {
  const { object, key, value } = target;
  return () => ({
    // because one of the key may be redundant
    // we have to iterate over keys to find and skip it
    [Symbol.iterator]: function* () {
      for (const k of map.keys()) {
        if (k !== key) {
          yield [k, map.get(k)];
        }
      }
      yield [key, value];
    },
  });
}

function makeKeyIterator<KeyType, ValueType>(
  target: ObjectSetInfo<KeyType, ValueType>,
) {
  const { object, key } = target;
  return () => ({
    [Symbol.iterator]: function* () {
      for (const k of map.keys()) {
        if (k !== key) {
          yield k;
        }
      }
      yield key;
    },
  });
}

function getter<KeyType, ValueType>(
  target: ObjectSetInfo<KeyType, ValueType>,
  key: KeyType,
) {
  return key === target.key ? target.value : target.object.get(key);
}

function haser<KeyType, ValueType>(
  target: ObjectSetInfo<KeyType, ValueType>,
  key: KeyType,
) {
  return key === target.key ? true : target.object.has(key);
}
function makeEach<KeyType, ValueType>(target: ObjectSetInfo<KeyType, ValueType>) {
  const { object, key, value } = target;
  return (eachFN: IterFn<KeyType, ValueType>) => {
    map.forEach((v, k) => {
      if (k !== key) {
        eachFN(v, k);
      }
    });
    eachFN(value, key);
  };
}

function size<KeyType, ValueType>(target: ObjectSetInfo<KeyType, ValueType>) {
  const { object, key } = target;
  return map.has(key) ? map.size : map.size + 1;
}*/

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
      console.log('getting', method, 'from', target.object, 'osi', target);
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
      if (target.key in target.object) {
        return Reflect.ownKeys(target.object);
      }
      return new Set([...Reflect.ownKeys(target.object), target.key]).values();
    },
    deleteProperty(): boolean {
      throw new Error('forest objects are immutable - cannot delete keys');
    },
  };

  // @ts-expect-error 2345
  return new Proxy(target, handler) as Record<KeyType, ValueType>;
}
