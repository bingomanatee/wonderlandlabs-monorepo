import type { CollectionIF } from '../../types/type.collection';
import { Collection } from '../Collection';
import type { FieldMap, FormCollectionIF } from './types.formCollection';
/**
 * this is a "utility sub-class" of FormCollection designed exclusively
 * to track the field properties of FormCollection's fields.
 *
 * As it encases all values in a FieldExtended instance,
 * its designed to augment the subject by a "mapped map" of its sourced
 * values, allowing for the initial statics and validators to
 * provide defaults for the transient properties.
 */
export declare class FormFieldMapCollection extends Collection<FieldMap> implements CollectionIF<FieldMap> {
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
}
