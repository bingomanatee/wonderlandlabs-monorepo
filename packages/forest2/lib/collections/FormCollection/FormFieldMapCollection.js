"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormFieldMapCollection = void 0;
const Collection_1 = require("../Collection");
const rxjs_1 = require("rxjs");
const FieldExtended_1 = require("./FieldExtended");
/**
 * this is a "utility sub-class" of FormCollection designed exclusively
 * to track the field properties of FormCollection's fields.
 *
 * As it encases all values in a FieldExtended instance,
 * its designed to augment the subject by a "mapped map" of its sourced
 * values, allowing for the initial statics and validators to
 * provide defaults for the transient properties.
 */
class FormFieldMapCollection extends Collection_1.Collection {
    constructor(name, fields, formCollection) {
        super(name, {
            initial: fields,
        }, formCollection.forest);
        this.name = name;
        this.formCollection = formCollection;
    }
    get subject() {
        return super.subject.pipe((0, rxjs_1.map)((fieldMap) => {
            let map = new Map(fieldMap);
            for (const [name, field] of fieldMap) {
                const mappedField = new FieldExtended_1.FieldExtended(field, name, this.formCollection);
            }
            return map;
        }));
    }
}
exports.FormFieldMapCollection = FormFieldMapCollection;
