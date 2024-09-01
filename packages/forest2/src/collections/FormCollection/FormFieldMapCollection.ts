import type { CollectionIF } from "../../type.collection";
import { Collection } from "../Collection";
import { map } from "rxjs";

import type {
  FieldMap,
  FieldValidator,
  FormCollectionIF,
} from "./types.formCollection";
import { FieldExtended } from "./FieldExtended";

export class FormFieldMapCollection extends Collection<FieldMap> {
  constructor(
    public name: string,
    fields: FieldMap,
    private formCollection: FormCollectionIF
  ) {
    super(
      name,
      {
        initial: fields,
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

