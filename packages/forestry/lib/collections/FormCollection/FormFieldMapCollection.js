"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormFieldMapCollection = void 0;
const extendField_1 = __importDefault(require("./extendField"));
const MapCollection_1 = require("../MapCollection/MapCollection");
/**
 * this is a "utility sub-class" of FormCollection designed exclusively
 * to track the field properties of FormCollection's fields.
 *
 * As it encases all values in a FieldExtended instance,
 * its designed to augment the subject by a "mapped map" of its sourced
 * values, allowing for the initial statics and validators to
 * provide defaults for the transient properties.
 */
class FormFieldMapCollection extends MapCollection_1.MapCollection {
    name;
    formCollection;
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
    /**
     * sets (adds or updates) the value for a keyed item
     * @param {KeyType} name
     * @param {ValueType} value
     * @returns
     */
    setFieldValue(name, value) {
        if (!this.tree.top) {
            throw new Error('canot setFieldValue to empty FormFieldMapCollection');
        }
        if (!this.tree.top.value.has(name)) {
            throw new Error('no ' + name + ' in form');
        }
        const field = this.get(name);
        const basis = this.formCollection.fieldBaseParams.get(name) ?? {};
        const newField = (0, extendField_1.default)({ value, edited: true }, field, basis);
        this.set(name, newField);
    }
    updateFieldProperty(name, key, value) {
        if (key === 'value') {
            return this.setFieldValue(name, value);
        }
        if (!this.tree.top) {
            throw new Error('canot setFieldValue to empty FormFieldMapCollection');
        }
        if (!this.tree.top.value.has(name)) {
            throw new Error('no ' + name + ' in form');
        }
        const field = this.get(name);
        const basis = this.formCollection.fieldBaseParams.get(name) ?? {};
        const newField = (0, extendField_1.default)({ [key]: value }, field, basis);
        this.set(name, newField);
    }
    /**
     * update a field parametrically with a mutation function
     *
     * @param name string
     * @param mutator (field) => field
     */
    updateField(name, mutator) {
        if (!this.tree.top) {
            throw new Error('canot setFieldValue to empty FormFieldMapCollection');
        }
        if (!this.tree.top.value.has(name)) {
            throw new Error('no ' + name + ' in form');
        }
        const field = this.get(name);
        const updatedField = mutator(field, this.formCollection);
        const basis = this.formCollection.fieldBaseParams.get(name) ?? {};
        const newField = (0, extendField_1.default)(updatedField, basis);
        this.set(name, newField);
    }
    commit(name) {
        if (name === true) {
            const self = this;
            this.forest.do(() => {
                for (const fieldName of self.keys()) {
                    this.updateFieldProperty(fieldName, 'committed', true);
                }
            });
        }
        else {
            this.updateFieldProperty(name, 'committed', true);
        }
    }
    updateFieldProps(name, props, propsToDelete) {
        return this.updateField(name, (field, formCollection) => {
            const basis = formCollection.fieldBaseParams.get(name) ?? {};
            const basisProps = basis.props ? basis.props : {};
            const currentProps = field.props ? field.props : {};
            const newProps = { ...basisProps, currentProps, props };
            if (propsToDelete) {
                for (const p of propsToDelete) {
                    delete newProps[p];
                }
            }
            return { props: newProps, ...field }; // updatedField will extend the field/update errors
        });
    }
}
exports.FormFieldMapCollection = FormFieldMapCollection;
