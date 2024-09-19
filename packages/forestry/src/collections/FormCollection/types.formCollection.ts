import type { ForestIF } from "../../types/types.forest.ts";

export type FieldProps = Record<string, any>;
export type FieldValue = string | number;
export type FieldMap = Map<string, FieldIF>;

export type ErrorMessageMap = Map<number, string>;
export type FieldValidator = (
  field: FieldIF,
  previousErrors: FieldError[]
) => FieldError | undefined | null | false;
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
  inputType?: string; // text, number, date, etc.
  componentType?: string; // eg "input", "select", "textfield" ... or can be a custom compopnent you develop
  props?: FieldProps; // generic extension point for any needed info
  isRequired?: boolean;
  order?: number;
  label?: string | undefined;
  validators?: FieldValidator | FieldValidator[];

  baseParams?: FieldBase;
}

// These are the "initial and default" values any field may define.
export type FieldBase = Partial<Omit<FieldIF, "baseParams" | "value">>;

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
  commit(name?: string | boolean): void;
}

export type FieldMutatorFN = (
  field: FieldIF,
  formCollection: FormCollectionIF
) => FieldIF;
