"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Forest_1 = require("../../Forest");
const rxjs_1 = require("rxjs");
const types_formCollection_1 = require("./types.formCollection");
const FormFieldMapCollection_1 = require("./FormFieldMapCollection");
class FormCollection {
    constructor(name, fields, params) {
        this.name = name;
        this.params = params;
        this.fieldBaseParams = new Map();
        this.fieldMap = new Map();
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
        this.makeFieldMapCollection(fieldMap);
    }
    makeFieldMapCollection(fieldMap) {
        const name = this.forest.uniqueTreeName(this.name + ':fields');
        this._fieldMapCollection = new FormFieldMapCollection_1.FormFieldMapCollection(name, fieldMap, this);
    }
    initForm(initialForm) {
        if (initialForm) {
            this.form = initialForm;
        }
    }
    // #endregion
    // region value, stream, next;
    get value() {
        return {
            form: this.form,
            fields: this.fieldMap,
        };
    }
    get stream() {
        if (!this._stream) {
            this._stream = new rxjs_1.BehaviorSubject({
                fields: this.fieldMap,
                form: this.form,
            });
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
    mutate(next, seed, ...rest) {
        throw new Error('not implemented');
        return this;
    }
    next(next) {
        throw new Error('not implemented');
        return this;
    }
}
