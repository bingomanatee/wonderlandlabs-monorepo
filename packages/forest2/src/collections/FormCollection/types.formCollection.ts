import type { CollectionIF } from "../../type.collection";
import type { ForestIF } from "../../types.forest";

export type FieldProps = Record<string, any>;
export type FieldValue = string | number;
export type FieldMap = Map<string, FieldIF>;

export function isFieldValue(a: unknown): a is FieldValue {
  return ["strng", "number"].includes(typeof a);
}

export type ErrorMessageMap = Map<number, string>;
export type FieldValidator = (
  field: FieldIF
) => FieldError | void | false | null;
export type FieldError = {
  message: string;
  severity?: number; // "severity" is a subjective and optional property;
  // it could be used to sort orders, determine if the error should block
  // form submission, or to determine the single most "severe" error to display.
};
export interface FieldIF {
  name: string;
  label?: string | undefined;
  value: FieldValue;
  props?: FieldProps; // an extension point for any custom tracker props
  staticProps?: FieldProps; // this is a "constructor" property
  errors?: FieldError[];
  validators?: FieldValidator | FieldValidator[];
  edited?: boolean;
  required?: boolean;
  order?: number;
}

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

export type PropMap = Map<string, FieldProps>;

export type FieldList = FieldIF[];
export type FieldRecord = Record<string, Partial<FieldIF>>;

export function isObj(a: unknown): a is object {
  return Boolean(a && typeof a === "object");
}

export function isField(a: unknown): a is FieldIF {
  if (!isObj(a)) return false;
  const o = a as object;

  return Boolean(
    "name" in o &&
      "value" in o &&
      typeof o.name === "string" &&
      (typeof o.value === "number" || typeof o.value === "string")
  );
}

export function isFieldList(a: unknown): a is FieldList {
  return Array.isArray(a) && a.every(isField);
}

export function isFieldRecord(a: unknown): a is FieldRecord {
  if (!isObj(a)) return false;
  const o = a as object;
  if (!Array.from(Object.values(o)).every(isField)) return false;
  if (!Array.from(Object.keys(o)).every((k: unknown) => typeof k === "string"))
    return false;
  return true;
}

export interface FormCollectionIF extends CollectionIF<FormSetIF> {
  forest: ForestIF;
  staticProps: PropMap;
}
