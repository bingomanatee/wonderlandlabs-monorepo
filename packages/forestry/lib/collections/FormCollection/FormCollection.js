"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Forest_1 = require("../../Forest");
const rxjs_1 = require("rxjs");
const types_formCollection_1 = require("./types.formCollection");
const FormFieldMapCollection_1 = require("./FormFieldMapCollection");
class FormCollection {
    constructor(name, fields, params) {
        this.name = name;
        this.fieldBaseParams = new Map();
        // #region form
        this.form = {};
        this.forest = params?.forest ?? new Forest_1.Forest();
        this.initFields(fields);
        this.initForm(params?.form);
    }
    /**
     * interprets fields into a fieldMap.
     * @param {FieldDef} fields
     */
    initFields(fields) {
        const fieldMap = new Map();
        const add = (name, value, baseParams, rest) => {
            const field = { name, value, ...rest };
            if (baseParams) {
                this.fieldBaseParams.set(name, baseParams);
            }
            fieldMap.set(name, field);
        };
        if ((0, types_formCollection_1.isFieldList)(fields)) {
            for (const { name, baseParams: baseParams, value, ...rest } of fields) {
                add(name, value, baseParams, rest);
            }
        }
        else if ((0, types_formCollection_1.isFieldRecord)(fields)) {
            const keys = Object.keys(fields);
            for (const key of keys) {
                const record = fields[key];
                const { baseParams, value, ...rest } = record;
                if (!(0, types_formCollection_1.isFieldValue)(value)) {
                    throw new Error('bad field value');
                }
                add(key, value, baseParams, rest);
            }
        }
        else {
            throw new Error('bad feilds type in FormCollection');
        }
        const fcName = this.forest.uniqueTreeName(this.name + ':fields');
        this.fieldMapCollection = new FormFieldMapCollection_1.FormFieldMapCollection(fcName, fieldMap, this);
    }
    initForm(initialForm) {
        if (initialForm) {
            this.form = initialForm;
        }
    }
    // #endregion
    // region value, stream, next;
    get value() {
        return this.stream.value;
    }
    get stream() {
        if (!this._stream) {
            this._stream = new rxjs_1.BehaviorSubject({
                fields: this.fieldMapCollection.value,
                form: this.form,
            });
            // at this point we are assuming that the form is static;
            const self = this;
            this.fieldMapCollection.tree.subject // note - _fieldMapCollection is always instatntiated in the consctructor
                .pipe((0, rxjs_1.map)((fields) => ({ fields, form: self.form })))
                .subscribe(this._stream);
        }
        return this._stream;
    }
    // @s-expect-error TS2416
    subscribe(observer) {
        if (typeof observer === 'function') {
            observer = { next: observer };
        }
        // @s-expect-error TS2416
        return this.stream.subscribe(observer);
    }
    setFieldValue(name, value) {
        this.fieldMapCollection?.setFieldValue(name, value);
    }
    updateFieldProperty(name, key, value) {
        this.fieldMapCollection?.updateFieldProperty(name, key, value);
    }
    updateField(name, mutator) {
        this.fieldMapCollection?.updateField(name, mutator);
    }
    get isValid() {
        for (const [, field] of this.fieldMapCollection.value) {
            if (field.errors?.length) {
                return false;
            }
        }
        return true;
    }
}
exports.default = FormCollection;
