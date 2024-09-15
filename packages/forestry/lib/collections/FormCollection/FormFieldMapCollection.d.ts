import type { CollectionIF } from "../../types/type.collection";
import type { FieldMap, FormCollectionIF, FieldIF, FieldMutatorFN, FieldProps } from "./types.formCollection";
import MapCollection from "../MapCollection/MapCollection";
/**
 * this is a "utility sub-class" of FormCollection designed exclusively
 * to track the field properties of FormCollection's fields.
 *
 * As it encases all values in a FieldExtended instance,
 * its designed to augment the subject by a "mapped map" of its sourced
 * values, allowing for the initial statics and validators to
 * provide defaults for the transient properties.
 */
export declare class FormFieldMapCollection extends MapCollection<string, FieldIF> implements CollectionIF<Map<string, FieldIF>> {
    name: string;
    private formCollection;
    constructor(name: string, fields: FieldMap, formCollection: FormCollectionIF);
    /**
     * sets (adds or updates) the value for a keyed item
     * @param {KeyType} name
     * @param {ValueType} value
     * @returns
     */
    setFieldValue(name: string, value: string | number): void;
    updateFieldProperty(name: string, key: string, value: any): void;
    /**
     * update a field parametrically with a mutation function
     *
     * @param name string
     * @param mutator (field) => field
     */
    updateField(name: string, mutator: FieldMutatorFN): void;
    updateFieldProps(name: string, props: FieldProps, propsToDelete?: string[]): void;
}
