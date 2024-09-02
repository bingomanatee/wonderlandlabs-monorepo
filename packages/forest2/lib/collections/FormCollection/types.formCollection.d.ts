import type { CollectionIF } from "../../type.collection";
import type { ForestIF } from "../../types.forest";
export type FieldProps = Record<string, any>;
export type FieldValue = string | number;
export type FieldMap = Map<string, FieldIF>;
export declare function isFieldValue(a: unknown): a is FieldValue;
export type ErrorMessageMap = Map<number, string>;
export type FieldValidator = (field: FieldIF) => FieldError | void | false | null;
export type FieldError = {
    message: string;
    severity?: number;
};
export interface FieldIF {
    name: string;
    label?: string | undefined;
    value: FieldValue;
    props?: FieldProps;
    baseParams?: FieldBaseParams;
    errors?: FieldError[];
    validators?: FieldValidator | FieldValidator[];
    edited?: boolean;
    required?: boolean;
    order?: number;
}
export type FieldBaseParams = Partial<Omit<FieldIF, "baseParams" | "value">>;
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
export declare function isObj(a: unknown): a is object;
export declare function isField(a: unknown): a is FieldIF;
export declare function isFieldList(a: unknown): a is FieldList;
export declare function isFieldRecord(a: unknown): a is FieldRecord;
export type BaseParamMap = Map<string, FieldBaseParams>;
export interface FormCollectionIF extends CollectionIF<FormSetIF> {
    forest: ForestIF;
    fieldBaseParams: BaseParamMap;
}
