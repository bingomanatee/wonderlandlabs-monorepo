import type { IterFn } from "../types.shared";
import { canProxy, isMapKey, noSet } from "./MapCollection";

function makeIterator<KeyType, ValueType>(
  target: Map<KeyType, ValueType>,
  key: KeyType,
  value: ValueType
) {
  return function* () {
    for (const list of target) {
      yield list;
    }
    yield [value, key];
  };
}

function makeValueIterator<KeyType, ValueType>(
  target: Map<KeyType, ValueType>,
  key: KeyType,
  value: ValueType
) {
  return {
    // because one of the key may be redundant
    // we have to iterate over keys to find and skip it
    [Symbol.iterator]: function* () {
      for (const k of target.keys()) {
        if (k !== key) yield target.get(k);
      }
      yield value;
    },
  };
}

function makeKeyIterator<KeyType, ValueType>(
  target: Map<KeyType, ValueType>,
  key: KeyType
) {
  return {
    [Symbol.iterator]: function* () {
      for (const k of target.keys()) {
        if (k !== key) yield k;
      }
      yield key;
    },
  };
}

function makeEach<KeyType, ValueType>(
  target: Map<KeyType, ValueType>,
  key: KeyType,
  value: ValueType
) {
  return (eachFN: IterFn<KeyType, ValueType>) => {
    target.forEach((v, k) => {
      if (k !== key) eachFN(v, k);
    });
    eachFN(value, key);
  };
}

export function setProxy<KeyType = unknown, ValueType = unknown>(
  map: Map<KeyType, ValueType>,
  key: KeyType,
  value: ValueType
) {
  if (!canProxy) {
    let newMap = new Map<KeyType, ValueType>(map);
    newMap.set(key, value);
  }

  return new Proxy(map, {
    get(target: Map<KeyType, ValueType>, method: keyof typeof map) {
      if (!isMapKey<Map<KeyType, ValueType>>(map, method)) {
        throw new Error("bad key");
      }

      let out: any = undefined;
      switch (method) {
        case "get":
          out = (k: KeyType) => (k === key ? value : target.get(k));
          break;

        case "set":
          out = noSet;
          break;

        case "has":
          out = (k: KeyType) => k === key || target.has(k);
          break;

        case "forEach":
          out = makeEach<KeyType, ValueType>(target, key, value);
          break;

        case "keys":
          out = () => makeKeyIterator<KeyType, ValueType>(target, key);
          break;

        case "values":
          out = () => makeValueIterator<KeyType, ValueType>(target, key, value);
          break;

        case "size":
          out = target.size + (target.has(key) ? 0 : 1);
          break;

        case Symbol.iterator:
          out = makeIterator<KeyType, ValueType>(target, key, value);
          break;
      }
      return out;
    },
  });
}
