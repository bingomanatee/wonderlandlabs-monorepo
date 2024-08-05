import { Form } from "./Form";
import { FieldIF, FormDefIF, FormIF } from "./Form.types";

export class FormDef implements FormDefIF {
  constructor(params?: Partial<FormDefIF>) {
    this.form = params?.form ?? new Form();
    this.fields = params?.fields ?? new Map();
  }
  form: FormIF;
  fields: Map<string, FieldIF>;
}
