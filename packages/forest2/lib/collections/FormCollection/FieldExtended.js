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
    }
    get value() {
        return this.field.value;
    }
    get staticProps() {
        return this.formCollection.staticProps?.get(this.name);
    }
    get props() {
        if (this._props === UNSET) {
            this._props = [this.staticProps, this.field.props].reduce((out, item) => {
                if (item) {
                    return { ...out, ...item };
                }
                return out;
            }, {});
        }
        return Array.isArray(this._props) ? this._props : undefined;
    }
    get validators() {
        if (this._validators === UNSET) {
            this._validators = [
                this.staticProps?.validators,
                this.field.validators,
            ].flat();
        }
        return typeof this._validators === 'symbol' ? undefined : this._validators;
    }
    /**
     * summarizes all the errors in the
     * @returns FieldError[]
     */
    get errors() {
        let errors = [];
        this.validators?.forEach((v) => {
            if (v) {
                let err = v(this);
                if (err && !errors.some((e) => (0, lodash_isequal_1.default)(e, err))) {
                    // errors should not be redundant - that being said, small variations will seep through.
                    errors.push(err);
                }
            }
        });
        return errors;
    }
    get edited() {
        return Boolean(this.field.edited);
    }
    get required() {
        return Boolean(this.field.required);
    }
    get order() {
        return this.field.order;
    }
}
exports.FieldExtended = FieldExtended;
