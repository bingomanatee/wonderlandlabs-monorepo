import type { CollectionIF } from "../../type.collection";
import { Collection } from "../Collection";
import { map } from "rxjs";

import type { FieldMap, FormCollectionIF } from "./types.formCollection";
import { FieldExtended } from "./FieldExtended";

/**
 * this is a "utility sub-class" of FormCollection designed exclusively
 * to track the field properties of FormCollection's fields.
 *
 * As it encases all values in a FieldExtended instance,
 * its designed to augment the subject by a "mapped map" of its sourced
 * values, allowing for the initial statics and validators to
 * provide defaults for the transient properties.
 */
export class FormFieldMapCollection extends Collection<FieldMap> {
  constructor(
    public name: string,
    fields: FieldMap,
    private formCollection: FormCollectionIF
  ) {

    const mappedFields = new Map();

    for (const [name, field] of fields ) {
        mappedFields.set(name, new FieldExtended(field, name, formCollection));
    }

    super(
      name,
      {
        initial: mappedFields,
      },
      formCollection.forest
    );
  }

  protected get subject() {
    return super.subject.pipe(
      map((fieldMap: FieldMap) => {
        let map = new Map(fieldMap);
        for (const [name, field] of fieldMap) {
          const mappedField = new FieldExtended(
            field,
            name,
            this.formCollection
          );
        }
        return map;
      })
    );
  }
}
