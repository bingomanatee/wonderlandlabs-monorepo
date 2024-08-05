import { FormIF, FormStatus, ButtonIF, isFieldIF } from "./Form.types";

export class Form implements FormIF {
  constructor(params?: Partial<FormIF>) {
    this.status = params?.status ?? FormStatus.active;
    this.title = params?.title;
    this.notes = params?.notes;
    this.name = params?.name ?? "";
    this.buttons = params?.buttons ?? new Map();
  }
  name?: string | undefined;
  title?: string | undefined;
  notes?: string | undefined;
  status: string;
  buttons?: Map<string, ButtonIF> | undefined;

  set(key, val) {
    const fields = new Map(this.fields);
    if (isFieldIF(val)) {
      fields.set(key, val);
    } else {
      const newField = fields.has(key) ? new Field(fields.get(key) : new Field());
      
      if (isFieldPairIF(val) || isFieldValue(val)) {
        newField.value = val;
      } else {
        throw new Error("bad set value");
      }

      if (params) {
        if (newField.params) {
          newField.params = { ...newField.params, params };
        } else {
          newField.params = params;
        }
      }
    }
  }
}
