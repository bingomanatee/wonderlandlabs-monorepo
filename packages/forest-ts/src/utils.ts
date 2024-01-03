import { QueryDef } from './types';
import { isEqual } from 'lodash';

export function compareMaps(map1: Map<any, any>, map2: Map<any, any>, query: QueryDef) {

  if (query.identity) {
    const firstValue = map1.get(query.identity);
    const secondValue = map2.get(query.identity);
    return isEqual(firstValue, secondValue);
  }

  if (map1.size !== map2.size) {
    return false;
  }
  return Array.from(map1.keys()).every((key) => {
    const v1 = map1.get(key);
    const v2 = map2.get(key);

    if (v1 === v2) {
      return true;
    }
    return isEqual(v1, v2);
  });

}
