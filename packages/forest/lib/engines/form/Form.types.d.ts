import { GenFun, GenObj, TreeIF } from "../../types";
import Field from "./Field";
export type FieldValidatorFn = (field: Field, tree: TreeIF) => string | false | void;
export interface FieldValidator {
    name: string;
    validator: FieldValidatorFn;
}
export interface FieldParams extends GenObj {
    options?: any[];
    defaultValue?: any;
    min?: number;
    max?: number;
    order?: number;
    label?: string;
    required?: boolean;
    id?: string;
    style?: GenObj;
    className?: string;
    validators?: FieldValidator[];
    exposure?: boolean | 'hidden';
}
export interface FieldInfo {
    params?: FieldParams;
    value: unknown;
    disabled?: boolean;
    data?: unknown;
    errors?: Record<string, string>;
    info?: Record<string, unknown>;
}
export type FieldValue = number | string;
export interface FieldPairIF {
    value: FieldValue;
    data: unknown;
}
export declare function isFieldPairIF(a: unknown): a is FieldPairIF;
export declare function isFieldValue(a: unknown): a is FieldValue;
export type FieldValueType = FieldValue | FieldPairIF;
export interface FieldIF {
    tree?: TreeIF;
    name: string;
    value: FieldValueType;
    params?: Partial<FieldParams>;
}
export declare function isFieldIF(a: unknown): a is FieldIF;
export declare function isFormAndFieldsIF(a: unknown): a is FormAndFieldsIF;
export declare const FormStatus: {
    active: string;
    locked: string;
    hidden: string;
    submitting: string;
    submitted: string;
    failed: string;
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
export type FieldMap = Map<string, FieldIF>;
export interface FormAndFieldsIF {
    form: FormIF;
    fields: FieldMap;
}
export declare function isForm(a: unknown): a is FormIF;
export {};
