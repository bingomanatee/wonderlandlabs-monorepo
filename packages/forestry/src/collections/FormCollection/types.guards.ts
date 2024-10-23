import { isObj } from './../../types/types.guards';
import type { FieldIF } from './types.formCollection';
import type {
  FieldValue,
  FieldRecord,
  FieldList,
} from './types.formCollection';

export function isFieldList(a: unknown): a is FieldList {
  return Array.isArray(a) && a.every(isFieldIF);
}

export function isFieldValue(a: unknown): a is FieldValue {
  return typeof a == 'string' || typeof a === 'number';
}

export function isFieldRecord(a: unknown): a is FieldRecord {
  if (!isObj(a)) {
    return false;
  }
  const o = a as object;
  if (!Array.from(Object.values(o)).every(isFieldIF)) {
    return false;
  }
  if (
    !Array.from(Object.keys(o)).every((k: unknown) => typeof k === 'string')
  ) {
    return false;
  }
  return true;
}

export function isFieldIF(a: unknown): a is FieldIF {
  if (!isObj(a)) {
    return false;
  }
  const o = a as Record<string, any>;

  if (
    !(
      'name' in o &&
      'value' in o &&
      typeof o.name === 'string' &&
      isFieldValue(o.value)
    )
  ) {
    return false;
  }
  return true;
}
