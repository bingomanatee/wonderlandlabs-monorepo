import type { FieldIF, FormCollectionIF, FieldProps, FieldError, FieldValidator, FieldBase } from './types.formCollection';
/**
 * FieldExtended blends the properties of the static props of the
 * transient field with the staticProps from the formCollection's map.
 * --- deprecated - we are using functions now to extend fields.
 */
export declare class FieldExtended implements FieldIF {
    private field;
    name: string;
    private formCollection;
    constructor(field: FieldIF, name: string, formCollection: Partial<FormCollectionIF>);
    get value(): import("./types.formCollection").FieldValue;
    get baseParamsLocal(): FieldBase;
    private _props;
    get props(): FieldProps;
    private _validators;
    get validators(): FieldValidator[];
    private _errors;
    /**
     * summarizes all the errors in the
     * @returns FieldError[]
     */
    get errors(): FieldError[];
    get edited(): boolean;
    private _blend;
    get isRequired(): any;
    get order(): any;
    get label(): any;
}