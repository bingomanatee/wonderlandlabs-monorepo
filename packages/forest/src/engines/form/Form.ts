import { FormIF, FormStatus, ButtonIF } from "./Form.types";

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
}
