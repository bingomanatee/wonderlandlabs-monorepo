import { Collection } from "../Collection";
import type { FieldMap, FormCollectionIF } from "./types.formCollection";
/**
 * this is a "utility sub-class" of FormCollection designed exclusively
 * to track the field properties of FormCollection's fields.
 *
 * As it encases all values in a FieldExtended instance,
 * its designed to augment the subject by a "mapped map" of its sourced
 * values, allowing for the initial statics and validators to
 * provide defaults for the transient properties.
 */
export declare class FormFieldMapCollection extends Collection<FieldMap> {
    name: string;
    private formCollection;
    constructor(name: string, fields: FieldMap, formCollection: FormCollectionIF);
    protected get subject(): import("rxjs").Observable<Map<string, import("./types.formCollection").FieldIF>>;
}
