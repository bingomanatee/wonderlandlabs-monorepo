import { ObjectSetInfo } from './setObjectProxyFor';

export type ObjectDeleteInfo<KeyType extends keyof any, ValueType> = {
  object: Record<KeyType, ValueType>;
  keys: KeyType[];
};
/*

// import type { IterFn } from './../../types/types.shared';
import { noSet } from './ObjectCollection';
function makeIterator<KeyType, ValueType>(
  target: ObjectDeleteInfo<KeyType, ValueType>,
) {
  const { map, keys } = target;
  return function* () {
    for (const list of map) {
      const [listKey] = list;
      if (!keys.includes(listKey)) {
        yield list;
      }
    }
  };
}
function makeEntriesIterator<KeyType, ValueType>(
  target: ObjectDeleteInfo<KeyType, ValueType>,
) {
  const { map, keys } = target;
  return () => ({
    // because one of the key may be redundant
    // we have to iterate over keys to find and skip it
    [Symbol.iterator]: function* () {
      for (const k of map.keys()) {
        if (!keys.includes(k)) {
          yield [k, map.get(k)];
        }
      }
    },
  });
}

function makeValueIterator<KeyType, ValueType>(
  target: ObjectDeleteInfo<KeyType, ValueType>,
) {
  const { map, keys } = target;
  return () => ({
    // because one of the key may be redundant
    // we have to iterate over keys to find and skip it
    [Symbol.iterator]: function* () {
      for (const k of map.keys()) {
        if (!keys.includes(k)) {
          yield map.get(k);
        }
      }
    },
  });
}

function makeKeyIterator<KeyType, ValueType>(
  target: ObjectDeleteInfo<KeyType, ValueType>,
) {
  const { map, keys } = target;
  return () => ({
    [Symbol.iterator]: function* () {
      for (const k of map.keys()) {
        if (!keys.includes(k)) {
          yield k;
        }
      }
    },
  });
}

function getter<KeyType, ValueType>(
  target: ObjectDeleteInfo<KeyType, ValueType>,
  key: KeyType,
) {
  return target.keys.includes(key) ? undefined : target.map.get(key);
}

function haser<KeyType, ValueType>(
  target: ObjectDeleteInfo<KeyType, ValueType>,
  key: KeyType,
) {
  return key === !target.keys.includes(key) && target.map.has(key);
}
function makeEach<KeyType, ValueType>(
  target: ObjectDeleteInfo<KeyType, ValueType>,
) {
  const { map, keys } = target;
  return (eachFN: IterFn<KeyType, ValueType>) => {
    map.forEach((v, k) => {
      if (!keys.includes(k)) {
        eachFN(v, k);
      }
    });
  };
}

function size<KeyType, ValueType>(
  target: ObjectDeleteInfo<KeyType, ValueType>,
) {
  const { map, keys } = target;
  let count = map.size;
  for (const k of keys) {
    if (map.has(k)) {
      count -= 1;
    }
  }
  return Math.max(count, 0);
}*/

export function deleteObjectProxyFor<KeyType extends keyof any, ValueType>(
  target: ObjectDeleteInfo<KeyType, ValueType>,
) {
  const handler = {
    set() {
      throw new Error(
        'forest maps are immutable - cannot set any properties on maps',
      );
    },
    ownKeys(target: ObjectSetInfo<KeyType, ValueType>) {
      return Reflect.ownKeys(target.object).filter(
        // @ts-expect-error 2769
        (k: KeyType) => k !== target.key,
      );
    },
    getOwnPropertyDescriptor(
      target: ObjectSetInfo<KeyType, ValueType>,
      method: KeyType,
    ) {
      if (method === target.key) {
        return undefined;
      }
      // Return the actual property descriptor
      const descriptor = Reflect.getOwnPropertyDescriptor(
        target.object,
        method,
      );

      if (descriptor) {
        descriptor.configurable = true; // Required for the spread operator
      }
      return descriptor;
    },
    get(
      target: ObjectDeleteInfo<KeyType, ValueType>,
      method: keyof typeof target.object,
    ) {
      if (target.keys.includes(method)) {
        return undefined;
      }
      return target.object[method];
    },
  };

  // @ts-expect-error 2352
  return new Proxy(target, handler) as Record<KeyType, ValueType>;
}
