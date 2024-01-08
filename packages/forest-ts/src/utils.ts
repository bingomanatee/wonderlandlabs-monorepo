import { isEqual } from 'lodash';
import { TypeEnumType } from '@wonderlandlabs/walrus/dist/enums';
import { ErrorPlus } from './ErrorPlus';
import CollectionClass from './CollectionClass';
import { type as typeLib, TypeEnum } from '@wonderlandlabs/walrus';
import { QueryDef, RecordFieldSchema , DataID, Data } from './types';

export function compareMaps(map1: Map<DataID, Data>, map2: Map<DataID, Data>, query: QueryDef) {

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

export function validateField(value: Data, def: RecordFieldSchema, coll: CollectionClass) {
  if (def.name in value) {
    const fieldValue = value[def.name];
    const fvType = typeLib.describe(fieldValue, true) as TypeEnumType;
    if (def.type) {
      if (Array.isArray(def.type)) {
        if (!(def.type as TypeEnumType[]).includes(fvType)) {
          throw new ErrorPlus(`field ${def.name} does not match any allowed type`,
            { def, value, collection: coll.name });
        }
      } else {
        if (fvType !== def.type) {
          const info = {
            type: def.type,
            field: def.name,
            value, collection: coll.name
          };

          throw new ErrorPlus('field does not match allowed type',
            info);
        }
      }
    }
    if (def.validator) {
      const error = def.validator(fieldValue, coll);
      if (error) {
        throw new ErrorPlus(`failed validation filter for ${def.name}`,
          {
            field:
            def.name,
            value,
            collection: coll.name
          });
      }
    }
  } else {
    if (!def.optional) {
      throw new ErrorPlus(
        `validation error: ${coll.name} record missing required field ${def.name}`,
        { data: value, collection: coll, field: def.name }
      );
    }
  }
}

export function idStr(id: DataID) {
  if (typeof id === 'symbol') {
    return id.toString();
  }
  return `${id}`;
}