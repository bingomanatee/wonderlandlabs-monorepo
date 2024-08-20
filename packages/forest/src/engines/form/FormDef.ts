import { Form } from "./Form";
import { FieldIF, FormAndFieldsIF, FormIF } from "./Form.types";

export class FormDef implements FormAndFieldsIF {
  constructor(params?: Partial<FormAndFieldsIF>) {
    this.form = params?.form ?? new Form();
    this.fields = params?.fields ?? new Map();
  }
  form: FormIF;
  fields: Map<string, FieldIF>;
}
