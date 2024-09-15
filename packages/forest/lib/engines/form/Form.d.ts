import { FormIF, ButtonIF } from "./Form.types";
export declare class Form implements FormIF {
    constructor(params?: Partial<FormIF>);
    name?: string | undefined;
    title?: string | undefined;
    notes?: string | undefined;
    status: string;
    buttons?: Map<string, ButtonIF> | undefined;
}
