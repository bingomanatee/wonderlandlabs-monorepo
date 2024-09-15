"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormDef = void 0;
const Form_1 = require("./Form");
class FormDef {
    constructor(params) {
        this.form = params?.form ?? new Form_1.Form();
        this.fields = params?.fields ?? new Map();
    }
}
exports.FormDef = FormDef;
