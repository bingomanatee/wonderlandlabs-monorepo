import type { IterFn } from '../../types/types.shared';
import { noSet } from './MapCollection';

export type MapSetInfo<KeyType, ValueType> = {
  map: Map<KeyType, ValueType>;
  key: KeyType;
  value: ValueType;
};
function makeIterator<KeyType, ValueType>(
  target: MapSetInfo<KeyType, ValueType>
) {
  const { map, key, value } = target;
  return function* () {
    for (const list of map) {
      yield list;
    }
    yield [ key, value ];
  };
}

function makeValueIterator<KeyType, ValueType>(
  target: MapSetInfo<KeyType, ValueType>
) {
  const { map, key, value } = target;
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
  target: MapSetInfo<KeyType, ValueType>
) {
  const { map, key, value } = target;
  return () => ({
    // because one of the key may be redundant
    // we have to iterate over keys to find and skip it
    [Symbol.iterator]: function* () {
      for (const k of map.keys()) {
        if (k !== key) {
          yield [ k, map.get(k) ];
        }
      }
      yield [ key, value ];
    },
  });
}

function makeKeyIterator<KeyType, ValueType>(
  target: MapSetInfo<KeyType, ValueType>
) {
  const { map, key } = target;
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
  target: MapSetInfo<KeyType, ValueType>,
  key: KeyType
) {
  return key === target.key ? target.value : target.map.get(key);
}

function haser<KeyType, ValueType>(
  target: MapSetInfo<KeyType, ValueType>,
  key: KeyType
) {
  return key === target.key ? true : target.map.has(key);
}
function makeEach<KeyType, ValueType>(target: MapSetInfo<KeyType, ValueType>) {
  const { map, key, value } = target;
  return (eachFN: IterFn<KeyType, ValueType>) => {
    map.forEach((v, k) => {
      if (k !== key) {
        eachFN(v, k);
      }
    });
    eachFN(value, key);
  };
}

function size<KeyType, ValueType>(target: MapSetInfo<KeyType, ValueType>) {
  const { map, key } = target;
  return map.has(key) ? map.size : map.size + 1;
}

export function setProxyFor<KeyType = unknown, ValueType = unknown>(
  target: MapSetInfo<KeyType, ValueType>
) {
  const handler = {
    set() {
      throw new Error(
        'forest maps are immutable - cannot set any properties on maps'
      );
    },
    get(
      target: MapSetInfo<KeyType, ValueType>,
      method: keyof typeof target.map
    ) {
      let out: any = undefined;
      switch (method) {
      case 'get':
        out = (key: KeyType) => getter<KeyType, ValueType>(target, key);
        break;

      case 'set':
        out = noSet;
        break;

      case 'clear':
        out = noSet;
        break;

      case 'has':
        out = (key: KeyType) => haser<KeyType, ValueType>(target, key);
        break;

      case 'forEach':
        out = makeEach<KeyType, ValueType>(target);
        break;

      case 'keys':
        out = makeKeyIterator<KeyType, ValueType>(target);
        break;

      case 'values':
        out = makeValueIterator<KeyType, ValueType>(target);
        break;

      case 'entries':
        out = makeEntriesIterator<KeyType, ValueType>(target);
        break;

      case 'size':
        out = size<KeyType, ValueType>(target);
        break;

      case Symbol.iterator:
        out = makeIterator<KeyType, ValueType>(target);
        break;
      }
      return out;
    },
  };

  // @ts-expect-error 2352
  return new Proxy(target, handler) as Map<KeyType, ValueType>;
}
