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
        this.fieldMap = new Map();
        // #region form
        this.form = {};
        this.forest = params?.forest ?? new Forest_1.Forest();
        this.initFields(fields);
        this.initForm(params?.form);
    }
    get staticProps() {
        if (!this._staticProps) {
            this._staticProps = new Map();
        }
        return this._staticProps;
    }
    /**
     * interprets fields into a fieldMap.
     * @param {FieldDef} fields
     */
    initFields(fields) {
        const fieldMap = new Map();
        const add = (name, value, staticProps, rest) => {
            const field = { name, value, ...rest };
            if (staticProps) {
                this.staticProps.set(name, staticProps);
            }
            fieldMap.set(name, field);
        };
        if ((0, types_formCollection_1.isFieldList)(fields)) {
            for (const { name, staticProps, value, ...rest } of fields) {
                add(name, value, staticProps, rest);
            }
        }
        else if ((0, types_formCollection_1.isFieldRecord)(fields)) {
            const keys = Object.keys(fields);
            for (const key of keys) {
                const record = fields[key];
                const { staticProps, value, ...rest } = record;
                if (!(0, types_formCollection_1.isFieldValue)(value))
                    throw new Error("bad field value");
                add(key, value, staticProps, rest);
            }
        }
        this.fieldMap = fieldMap;
    }
    makeFieldMapCollection() {
        const name = this.forest.uniqueTreeName(this.name + ":fields");
        this._fieldMapCollection = new FormFieldMapCollection_1.FormFieldMapCollection(name, this.fieldMap, this);
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
        if (typeof observer === "function")
            observer = { next: observer };
        // @s-expect-error TS2416
        return this.stream.subscribe(observer);
    }
    mutate(next, seed, ...rest) {
        throw new Error("not implemented");
        return this;
    }
    next(next) {
        throw new Error("not implemented");
        return this;
    }
}
