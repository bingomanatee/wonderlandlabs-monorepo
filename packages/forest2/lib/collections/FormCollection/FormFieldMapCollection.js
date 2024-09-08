"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormFieldMapCollection = void 0;
const Collection_1 = require("../Collection");
const extendField_1 = __importDefault(require("./extendField"));
const utils_1 = require("../../utils");
const fieldMapSetValueProxy_1 = require("./fieldMapSetValueProxy");
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
        const mappedFields = new Map();
        for (const [name, field] of fields) {
            if (field.baseParams) {
                formCollection.fieldBaseParams.set(name, field.baseParams);
                delete field.baseParams;
            }
            mappedFields.set(name, (0, extendField_1.default)(field, formCollection.fieldBaseParams.get(name)));
        }
        super(name, {
            initial: mappedFields,
        }, formCollection.forest);
        this.name = name;
        this.formCollection = formCollection;
    }
    setFieldValue(name, value) {
        if (!this.value.has(name)) {
            console.warn('cannot set field value - no field "' +
                name +
                '" in this FormFieldMapCollection');
        }
        if (!this.tree.top) {
            throw new Error('canot setFieldValue to empty FormFieldMapCollection');
        }
        const map = this.tree.top.value;
        if (!map.has(name)) {
            throw new Error('FormFieldMapCollection does not have a field ' + name);
        }
        if (map.get(name).value === value) {
            return;
        } // unchanged value;
        const basis = this.formCollection.fieldBaseParams.get(name);
        // if we can use proxies, make a proxy of the map that returns a copy of the named field
        // with a different value for the name field
        // without exploding memory with duplicate maps all over the place.
        if (utils_1.canProxy) {
            const next = (0, fieldMapSetValueProxy_1.fieldMapSetValueProxy)(map, name, value, basis);
            this.next(next);
        }
        else {
            const prev = map.get(name);
            if (!prev) {
                throw new Error('cannot get ' + name);
            } // typescriptism
            const next = (0, extendField_1.default)({ name, value }, prev, basis);
            const newMap = new Map(map);
            newMap.set(name, next);
            this.next(newMap);
        }
    }
}
exports.FormFieldMapCollection = FormFieldMapCollection;
