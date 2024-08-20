import { FieldIF, FormAndFieldsIF, FormIF } from "./Form.types";
export declare class FormDef implements FormAndFieldsIF {
    constructor(params?: Partial<FormAndFieldsIF>);
    form: FormIF;
    fields: Map<string, FieldIF>;
}
