import type { ForestIF } from "../../types/types.forest";
export type FieldProps = Record<string, any>;
export type FieldValue = string | number;
export type FieldMap = Map<string, FieldIF>;
export type ErrorMessageMap = Map<number, string>;
export type FieldValidator = (field: FieldIF, previousErrors: FieldError[]) => FieldError | void | false | null;
export type FieldError = {
    message: string;
    severity?: number;
};
export interface FieldIF {
    name: string;
    value: FieldValue;
    edited?: boolean;
    errors?: FieldError[];
    props?: FieldProps;
    isRequired?: boolean;
    order?: number;
    label?: string | undefined;
    validators?: FieldValidator | FieldValidator[];
    baseParams?: FieldBase;
}
export declare function isFieldIF(a: unknown): a is FieldIF;
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
export type FieldList = FieldIF[];
export type FieldRecord = Record<string, Partial<FieldIF>>;
export declare function isFieldList(a: unknown): a is FieldList;
export declare function isFieldValue(a: unknown): a is FieldValue;
export declare function isFieldRecord(a: unknown): a is FieldRecord;
export type BaseParamMap = Map<string, FieldBase>;
export interface FormCollectionIF {
    forest: ForestIF;
    fieldBaseParams: BaseParamMap;
    setFieldValue(name: string, value: string | number): void;
    updateFieldProperty(name: string, key: string, value: any): void;
    updateField(name: string, mutator: FieldMutatorFN): void;
}
export type FieldMutatorFN = (field: FieldIF, formCollection: FormCollectionIF) => FieldIF;
