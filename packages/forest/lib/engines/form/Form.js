"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Form = void 0;
const Form_types_1 = require("./Form.types");
class Form {
    constructor(params) {
        this.status = params?.status ?? Form_types_1.FormStatus.active;
        this.title = params?.title;
        this.notes = params?.notes;
        this.name = params?.name ?? "";
        this.buttons = params?.buttons ?? new Map();
    }
}
exports.Form = Form;
