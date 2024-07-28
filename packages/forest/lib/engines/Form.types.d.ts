import { GenFun, GenObj, TreeIF } from "../types";
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
    label?: string;
    required?: boolean;
    id?: string;
    style?: GenObj;
    className?: string;
    validators?: FieldValidator[];
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
export default class Field implements FieldIF {
    constructor(input: FieldIF);
    tree?: TreeIF;
    name: string;
    value: FieldValue | FieldPairIF;
    params?: Partial<FieldParams>;
    private get defaultParams();
}
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
    fields: Map<string, FieldInfo>;
    buttons?: Map<string, ButtonIF>;
}
export declare function isForm(a: unknown): a is FormIF;
export {};
