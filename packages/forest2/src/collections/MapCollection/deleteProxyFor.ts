import type { IterFn } from "../../types.shared";
import { isMapKey, noSet } from "./MapCollection";

export type MapDeleteInfo<KeyType, ValueType> = {
  map: Map<KeyType, ValueType>;
  keys: KeyType[];
};

function makeIterator<KeyType, ValueType>(
  target: MapDeleteInfo<KeyType, ValueType>
) {
  const { map, keys } = target;
  return function* () {
    for (const list of map) {
      const [listKey] = list;
      if (!keys.includes(listKey)) yield list;
    }
  };
}

function makeValueIterator<KeyType, ValueType>(
  target: MapDeleteInfo<KeyType, ValueType>
) {
  const { map, keys } = target;
  return () => ({
    // because one of the key may be redundant
    // we have to iterate over keys to find and skip it
    [Symbol.iterator]: function* () {
      for (const k of map.keys()) {
        if (!keys.includes(k)) yield map.get(k);
      }
    },
  });
}
function makeEntriesIterator<KeyType, ValueType>(
  target: MapDeleteInfo<KeyType, ValueType>
) {
  const { map, keys } = target;
  return () => ({
    // because one of the key may be redundant
    // we have to iterate over keys to find and skip it
    [Symbol.iterator]: function* () {
      for (const k of map.keys()) {
        if (!keys.includes(k)) yield [k, map.get(k)];
      }
    },
  });
}

function makeKeyIterator<KeyType, ValueType>(
  target: MapDeleteInfo<KeyType, ValueType>
) {
  const { map, keys } = target;
  return () => ({
    [Symbol.iterator]: function* () {
      for (const k of map.keys()) {
        if (!keys.includes(k)) yield k;
      }
    },
  });
}

function getter<KeyType, ValueType>(
  target: MapDeleteInfo<KeyType, ValueType>,
  key: KeyType
) {
  return target.keys.includes(key) ? undefined : target.map.get(key);
}

function haser<KeyType, ValueType>(
  target: MapDeleteInfo<KeyType, ValueType>,
  key: KeyType
) {
  return key === !target.keys.includes(key) && target.map.has(key);
}
function makeEach<KeyType, ValueType>(
  target: MapDeleteInfo<KeyType, ValueType>
) {
  const { map, keys } = target;
  return (eachFN: IterFn<KeyType, ValueType>) => {
    map.forEach((v, k) => {
      if (!keys.includes(k)) eachFN(v, k);
    });
  };
}

function size<KeyType, ValueType>(target: MapDeleteInfo<KeyType, ValueType>) {
  const { map, keys } = target;
  let count = map.size;
  for (const k of keys) {
    if (map.has(k)) {
      count -= 1;
    }
  }
  return Math.max(count, 0);
}

export function deleteProxyFor<KeyType, ValueType>(
  target: MapDeleteInfo<KeyType, ValueType>
) {
  const handler = {
    get(
      target: MapDeleteInfo<KeyType, ValueType>,
      method: keyof typeof target.map
    ) {
      let out: any = undefined;
      switch (method) {
        case "get":
          out = (key: KeyType) => getter<KeyType, ValueType>(target, key);
          break;

        case "set":
          out = noSet;
          break;

        case "clear":
          out = noSet;

        case "has":
          out = (key: KeyType) => haser<KeyType, ValueType>(target, key);
          break;

        case "forEach":
          out = makeEach<KeyType, ValueType>(target);
          break;

        case "keys":
          out = makeKeyIterator<KeyType, ValueType>(target);
          break;

        case "values":
          out = makeValueIterator<KeyType, ValueType>(target);
          break;

          case 'entries': 
          out = makeEntriesIterator<KeyType, ValueType>(target);

        case "size":
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
