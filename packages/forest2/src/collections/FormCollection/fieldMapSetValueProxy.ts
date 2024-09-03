import { update } from 'lodash';
import type { IterFn } from '../../types.shared';
import { noSet } from '../MapCollection/MapCollection';
import extendField from './extendField';
import type {
  FieldBase,
  FieldIF,
  FieldMap,
  FieldValue,
} from './types.formCollection';

function getter(
  map: FieldMap,
  key: string,
  name: string,
  updatedField: FieldIF
) {
  if (key !== name) {return map.get(key);}
  return updatedField;
}

function makeIterator(map: FieldMap, name: string, newField: FieldIF) {
  return function* () {
    for (const list of map) {
      const [ listKey ] = list;
      if (listKey === name) {
        yield [ name, newField ];
      } else {yield list;}
    }
  };
}
function makeEntriesIterator(map: FieldMap, name: string, newField: FieldIF) {
  return () => ({
    // because one of the key may be redundant
    // we have to iterate over keys to find and skip it
    [Symbol.iterator]: function* () {
      for (const k of map.keys()) {
        if (k === name) {
          yield [ k, newField ];
        } else {
          yield [ k, map.get(k) ];
        }
      }
    },
  });
}
function makeValueIterator(map: FieldMap, name: string, newField: FieldIF) {
  return () => ({
    // because one of the key may be redundant
    // we have to iterate over keys to find and skip it
    [Symbol.iterator]: function* () {
      for (const k of map.keys()) {
        if (k === name) {
          yield newField;
        } else {
          yield map.get(k);
        }
      }
    },
  });
}

function makeForEach(map: FieldMap, name: string, newField: FieldIF) {
  return (fn: IterFn<string, FieldIF>) => {
    return map.forEach((value: FieldIF, key: string) => {
      if (key === name) {
        fn(newField, key);
      } else {
        fn(value, key);
      }
    });
  };
}

/**
 *
 * this is a proxy that returns values from the previous map EXCEPT for when you get the entry whose value has been changed
 * io which case you get the extenedField.
 *
 * @param map
 * @param name
 * @param value
 * @param basis
 * @returns
 */
export function fieldMapSetValueProxy(
  map: FieldMap,
  name: string,
  value: FieldValue,
  basis: FieldBase | undefined
) {
  const updatedField = extendField({ name, value, edited: true }, map.get(name), basis);
  const newGetter = (key: string) => getter(map, key, name, updatedField);

  const handler = {
    set() {
      throw new Error(
        'forest field maps are immutable - cannot set any properties on field maps'
      );
    },
    get(target: FieldMap, method: keyof typeof target) {
      let out: any = undefined;
      switch (method) {
      case 'get':
        out = newGetter;
        break;

      case 'set':
        out = noSet;
        break;

      case 'clear':
        out = noSet;
        break;

      case 'has':
        out = (key: KeyType) => target.has(key);
        break;

      case 'forEach':
        out = makeForEach(map, name, updatedField);
        break;

      case 'keys':
        out = () => target.keys();
        break;

      case 'values':
        out = makeValueIterator(map, name, updatedField);
        break;

      case 'entries':
        out = makeEntriesIterator(map, name, updatedField);
        break;

      case 'size':
        out = target.size;
        break;

      case Symbol.iterator:
        out = makeIterator(map, name, updatedField);
        break;
      }
      return out;
    },
  };

  // @ts-expect-error 2352
  return new Proxy(map, handler) as Map<KeyType, ValueType>;
}
