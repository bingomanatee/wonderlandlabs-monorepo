import type { ForestIF } from '../../types/types.forest';
import { isObj, isField } from '../../types/types.guards';

export type FieldProps = Record<string, any>;
export type FieldValue = string | number;
export type FieldMap = Map<string, FieldIF>;

export type ErrorMessageMap = Map<number, string>;
export type FieldValidator = (
  field: FieldIF,
  previousErrors: FieldError[]
) => FieldError | void | false | null;
export type FieldError = {
  message: string;
  severity?: number; // "severity" is a subjective and optional property;
  // it could be used to sort orders, determine if the error should block
  // form submission, or to determine the single most "severe" error to display.
};
export interface FieldIF {
  name: string;
  value: FieldValue;
  // ^ ^ the only required values

  edited?: boolean; // has the value been changed
  committed?: boolean; // has the field been "committed" (blur/tab/enter)
  errors?: FieldError[]; // transient - derived from validators if any.

  // v   v  v  values that are most likely NON chaqnging and present in baseParams.

  props?: FieldProps; // generic extension point for any needed info
  isRequired?: boolean;
  order?: number;
  label?: string | undefined;
  validators?: FieldValidator | FieldValidator[];

  baseParams?: FieldBase;
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

// These are the "initial and default" values any field may define.
export type FieldBase = Partial<Omit<FieldIF, 'baseParams' | 'value'>>;

export interface FormIF {
  name?: string;
  props?: Record<string, any>;
}
export interface FormSetIF {
  fields: FieldMap;
  form: FormIF;
  edited?: boolean;
}

export interface Params {
  form?: FormIF;
  errors?(input: FormSetIF): number[];
  errorMessages?: string[];
  forest?: ForestIF;
}

// #region field collections
export type FieldList = FieldIF[];
export type FieldRecord = Record<string, Partial<FieldIF>>;

export function isFieldList(a: unknown): a is FieldList {
  return Array.isArray(a) && a.every(isField);
}

export function isFieldValue(a: unknown): a is FieldValue {
  return typeof a == 'string' || typeof a === 'number';
}

export function isFieldRecord(a: unknown): a is FieldRecord {
  if (!isObj(a)) {
    return false;
  }
  const o = a as object;
  if (!Array.from(Object.values(o)).every(isField)) {
    return false;
  }
  if (
    !Array.from(Object.keys(o)).every((k: unknown) => typeof k === 'string')
  ) {
    return false;
  }
  return true;
}
// #endregion

export type BaseParamMap = Map<string, FieldBase>;

export interface FormCollectionIF {
  forest: ForestIF;
  fieldBaseParams: BaseParamMap;
  setFieldValue(name: string, value: string | number): void;
  updateFieldProperty(name: string, key: string, value: any): void;
  updateField(name: string, mutator: FieldMutatorFN): void;
  hasField(name: string): boolean;
  field(name: string): FieldIF | undefined;
  commit(name?: string | boolean) : void;
}

export type FieldMutatorFN = (
  field: FieldIF,
  formCollection: FormCollectionIF
) => FieldIF;
