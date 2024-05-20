import { type, TypeEnum } from '@wonderlandlabs/walrus';
import {
  MultiTableChange,
  TableChangeBase,
  TableChangeField,
  TableChangeValue,
} from './types';

type Obj = Record<string | number | symbol, unknown>;

export function isObj(x: unknown): x is Obj {
  return type.describe(x, true) === TypeEnum.object;
}

/**
 * tests for "general case" TableChange = TableChangeField | TableChangeMultiField | TableChangeValue
 * @param x
 */
export function isTableChangeBase(x: unknown): x is TableChangeBase {
  if (!isObj(x)) {
    return false;
  }
  if (!('table' in x || 'action' in x)) {
    return false;
  }
  //@TODO: test action
  if (!x.table || typeof x.table !== 'string') {
    return false;
  }
  return true;
}

export function isTableChangeField(x: unknown): x is TableChangeField {
  if (!isTableChangeBase(x)) {
    return false;
  }
  return 'id' in x && 'field' in x && 'value' in x;
}

export function isTableChangeValue(x: unknown): x is TableChangeValue {
  if (!isTableChangeBase(x)) {
    return false;
  }
  return 'id' in x && 'value' in x;
}

export function isForestChange(x: unknown): x is MultiTableChange {
  if (!isObj(x)) {
    return false;
  }
  if (!('action' in x && 'tableChanges' in x)) {
    return false;
  }
  return true;
}
