import { GenFun, GenObj, isObj, isTreeIF, TreeIF } from "../../types";
import Field from "./Field";

export type FieldValidatorFn = (
  field: Field,
  tree: TreeIF
) => string | false | void;

export interface FieldValidator {
  name: string;
  validator: FieldValidatorFn;
}

// FieldParams is the generally permanant config info about a field
export interface FieldParams extends GenObj {
  options?: any[]; // autocomplete/select
  defaultValue?: any;
  min?: number; //length, or for range or number control
  max?: number;
  order?: number;
  label?: string;
  required?: boolean;
  id?: string;
  style?: GenObj;
  className?: string;
  validators?: FieldValidator[];
}

// FieldInfo is the transient data stored in form.
export interface FieldInfo {
  params?: FieldParams;
  value: unknown;
  disabled?: boolean;
  // in cases where the value of an object is a complex term such as an object record of a select,
  // provide discrete fields for the data object and the string representor.
  data?: unknown;
  errors?: Record<string, string>;
  // any tracking info about the field you want to enable.
  info?: Record<string, unknown>;
}

export type FieldValue = number | string;
export interface FieldPairIF {
  value: FieldValue;
  data: unknown;
}

export function isFieldPairIF(a: unknown): a is FieldPairIF {
  if (!isObj(a)) return false;
  const o = a as GenObj;
  return "value" in o && "data" in o;
}

export function isFieldValue(a: unknown): a is FieldValue {
  return typeof a === "string" || typeof a === "number";
}

export type FieldValueType = FieldValue | FieldPairIF;

export interface FieldIF {
  tree?: TreeIF;
  name: string;
  value: FieldValueType;
  params?: Partial<FieldParams>;
}

export function isFieldIF(a: unknown): a is FieldIF {
  if (!isObj(a)) return false;
  const o = a as GenObj;

  if (!("tree" in o)) return false;
  if (!isTreeIF(o.tree)) return false;
  if (!["name" in o]) return false;
  if (!["value" in o]) return false;
  if (typeof o.name !== "string") return false;
  return true;
}

export const FormStatus = {
  active: "active",
  locked: "locked",
  hidden: "hidden",
  submitting: "submitting",
  submitted: "submitted",
  failed: "failed",
};

type FormStatusKeys = keyof typeof FormStatus;

export type FormStatusType = typeof FormStatus[FormStatusKeys];

export interface ButtonIF {
  name: string;
  label: string;
  icon: unknown;
  role: string;
  className?: string;
  style?: GenObj;
  disabled?: boolean;
  id?: string;
  variant?: string;
  textStyle?: GenObj;
  textClassName?: string;
  eventHandlers?: Map<string, GenFun>;
}

export interface FormIF {
  name?: string;
  title?: string;
  notes?: string;
  status: FormStatusType;
  buttons?: Map<string, ButtonIF>;
}

export interface FormDefIF {
  form: FormIF;
  fields: Map<string, FieldIF>;
}

export function isForm(a: unknown): a is FormIF {
  if (!isObj(a)) return false;
  const o = a as GenObj;

  for (const f of ["name", "title", "notes"])
    if (f in o) {
      if (typeof o[f] !== "string") return false;
    }

  if (!("status" in a) || typeof a.status !== "string") return false;
  if (!Array.from(Object.keys(FormStatus)).includes(a.status)) return false;

  if (!("fields" in a)) return false;
  if (!(a.fields instanceof Map)) return false;
  for (const [key, val] of a.fields) {
    if (!isFieldIF(val)) return false;
    if (typeof key !== "string") return false;
  }
  return true;
}
