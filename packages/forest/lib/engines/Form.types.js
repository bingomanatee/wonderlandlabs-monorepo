"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormStatus = void 0;
exports.isFieldPairIF = isFieldPairIF;
exports.isFieldValue = isFieldValue;
exports.isFieldIF = isFieldIF;
exports.isForm = isForm;
const types_1 = require("../types");
function isFieldPairIF(a) {
    if (!(0, types_1.isObj)(a))
        return false;
    const o = a;
    return "value" in o && "data" in o;
}
function isFieldValue(a) {
    return (typeof a === 'string') || (typeof a === 'number');
}
function isFieldIF(a) {
    if (!(0, types_1.isObj)(a))
        return false;
    const o = a;
    if (!('tree' in o))
        return false;
    if (!(0, types_1.isTreeIF)(o.tree))
        return false;
    if (![('name' in o)])
        return false;
    if (![('value' in o)])
        return false;
    if (typeof o.name !== 'string')
        return false;
    return true;
}
class Field {
    constructor(input) {
        this.tree = input.tree;
        this.name = input.name;
        this.value = input.value;
        this.params = [this.defaultParams, input.params].reduce((out, input) => {
            if ((0, types_1.isObj)(input)) {
                return { ...out, ...input };
            }
            return out;
        }, {});
    }
    get defaultParams() {
        let defaultParams;
        let fields = this.tree?.engineInput
            ? this.tree.engineInput.fields
            : undefined;
        if (fields) {
            if (fields.has(name)) {
                defaultParams = fields.get(name).params;
            }
        }
        return undefined;
    }
}
exports.default = Field;
exports.FormStatus = {
    active: "active",
    locked: "locked",
    hidden: "hidden",
    submitting: "submitting",
    submitted: "submitted",
    failed: "failed",
};
function isForm(a) {
    if (!(0, types_1.isObj)(a))
        return false;
    const o = a;
    for (const f of ["name", "title", "notes"])
        if (f in o) {
            if (typeof o[f] !== "string")
                return false;
        }
    if (!("status" in a) || typeof a.status !== "string")
        return false;
    if (!Array.from(Object.keys(exports.FormStatus)).includes(a.status))
        return false;
    if (!("fields" in a))
        return false;
    if (!(a.fields instanceof Map))
        return false;
    for (const [key, val] of a.fields) {
        if (!isFieldIF(val))
            return false;
        if (typeof key !== "string")
            return false;
    }
    return true;
}
