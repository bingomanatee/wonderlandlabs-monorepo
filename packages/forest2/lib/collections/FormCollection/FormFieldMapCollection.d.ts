import { Collection } from "../Collection";
import type { FieldMap, FormCollectionIF } from "./types.formCollection";
export declare class FormFieldMapCollection extends Collection<FieldMap> {
    name: string;
    private formCollection;
    constructor(name: string, fields: FieldMap, formCollection: FormCollectionIF);
    protected get subject(): import("rxjs").Observable<Map<string, import("./types.formCollection").FieldIF>>;
}
