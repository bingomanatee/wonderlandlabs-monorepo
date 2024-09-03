"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldExtended = void 0;
const lodash_isequal_1 = __importDefault(require("lodash.isequal"));
const UNSET = Symbol("unset");
/**
 * FieldExtended blends the properties of the static props of the
 * transient field with the staticProps from the formCollection's map.
 */
class FieldExtended {
    constructor(field, name, formCollection) {
        this.field = field;
        this.name = name;
        this.formCollection = formCollection;
        this._props = UNSET;
        this._validators = UNSET;
        this._errors = UNSET;
    }
    get value() {
        return this.field.value;
    }
    get baseParamsLocal() {
        return this.formCollection.fieldBaseParams?.get(this.name) ?? {};
    }
    get props() {
        if (this._props === UNSET) {
            this._props = [this.baseParamsLocal?.props, this.field.props].reduce((out, item) => {
                if (item) {
                    return { ...out, ...item };
                }
                return out;
            }, {});
        }
        return typeof this._props === "symbol" ? undefined : this._props;
    }
    get validators() {
        if (this._validators === UNSET) {
            this._validators = [
                this._blend("validators"),
                this.field.validators,
            ].flat();
        }
        return typeof this._validators === "symbol" ? undefined : this._validators;
    }
    /**
     * summarizes all the errors in the
     * @returns FieldError[]
     */
    get errors() {
        if (this._errors === UNSET) {
            const errors = [];
            this.validators?.forEach((v) => {
                if (v) {
                    const err = v(this, errors);
                    if (err && !errors.some((e) => (0, lodash_isequal_1.default)(e, err))) {
                        // errors should not be redundant - that being said, small variations will seep through.
                        errors.push(err);
                    }
                }
            });
            this._errors = errors;
            return errors;
        }
        return this._errors;
    }
    get edited() {
        return Boolean(this.field.edited);
    }
    // express
    _blend(propName) {
        if (propName in this.field) {
            return this.field[propName];
        }
        if (this.formCollection.fieldBaseParams.has(this.name) &&
            propName in this.formCollection.fieldBaseParams.get(this.name)) {
            return this.formCollection.fieldBaseParams.get(this.name)[propName];
        }
        return undefined;
    }
    get isRequired() {
        return this._blend("isRequired");
    }
    get order() {
        return this._blend("order");
    }
    get label() {
        return this._blend("label");
    }
}
exports.FieldExtended = FieldExtended;
