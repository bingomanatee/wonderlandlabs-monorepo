import {
  BaseRecordFieldSchema,
  CollectionIF,
  Data,
  isDataValidatorFn,
} from "../types/types.coll-data-validators";
import { ErrorPlus } from "../ErrorPlus";
import { type } from "@wonderlandlabs/walrus";

export function validateBaseFieldDef(
  baseFieldDef: BaseRecordFieldSchema,
  key: string,
  value: Data,
  collection: CollectionIF,
) {
  if (!(key in value)) {
    // handle missing values
    if (!baseFieldDef.optional) {
      throw new ErrorPlus("missing required field " + key, {
        collection,
        key,
        value,
      });
    }
  } else {
    // validate value if present
    const fieldValue = value[key];
    if (isDataValidatorFn(baseFieldDef.validator)) {
      baseFieldDef.validator(fieldValue, collection);
    }
    // validate type if defined
    if (baseFieldDef.type) {
      const fieldType = type.describe(fieldValue, true);
      if (fieldType !== baseFieldDef.type) {
        throw new ErrorPlus("type mismatch:" + key, {
          key,
          expected: baseFieldDef.type,
          actual: fieldType,
        });
      }
    }
  }
}
