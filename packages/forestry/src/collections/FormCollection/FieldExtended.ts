import {isEqual} from 'lodash-es';
import type {
  FieldIF,
  FormCollectionIF,
  FieldProps,
  FieldError,
  FieldValidator,
  FieldBase,
} from './types.formCollection';

type MessyValidator = FieldValidator | undefined;
type MessyValidators = MessyValidator[];
const UNSET = Symbol('unset');
/**
 * FieldExtended blends the properties of the static props of the
 * transient field with the staticProps from the formCollection's map.
 * --- deprecated - we are using functions now to extend fields. 
 */

export class FieldExtended implements FieldIF {
  constructor(
    private field: FieldIF,
    public name: string,
    private formCollection: Partial<FormCollectionIF>
  ) {}

  get value() {
    return this.field.value;
  }

  get baseParamsLocal(): FieldBase {
    return this.formCollection.fieldBaseParams?.get(this.name) ?? {};
  }

  private _props: FieldProps | undefined | symbol = UNSET;
  get props() {
    if (this._props === UNSET) {
      this._props = [ this.baseParamsLocal?.props, this.field.props ].reduce(
        (out: FieldProps, item: FieldProps | undefined) => {
          if (item) {
            return { ...out, ...item };
          }
          return out;
        },
        {}
      );
    }
    return typeof this._props === 'symbol' ? undefined : this._props;
  }

  private _validators: FieldValidator[] | undefined | symbol = UNSET;

  get validators() {
    if (this._validators === UNSET) {
      this._validators = [
        this._blend('validators'),
        this.field.validators,
      ].flat();
    }
    return typeof this._validators === 'symbol' ? undefined : this._validators;
  }

  private _errors: FieldError[] | symbol = UNSET;
  /**
   * summarizes all the errors in the
   * @returns FieldError[]
   */
  get errors(): FieldError[] {
    if (this._errors === UNSET) {
      const errors = [];
      this.validators?.forEach((v: FieldValidator | undefined) => {
        if (v) {
          const err = v(this, errors);
          if (err && !errors.some((e) => isEqual(e, err))) {
            // errors should not be redundant - that being said, small variations will seep through.
            errors.push(err);
          }
        }
      });
      this._errors = errors;
      return errors;
    }

    return this._errors as FieldError[];
  }

  get edited() {
    return Boolean(this.field.edited);
  }

  // express
  private _blend(propName: string) {
    if (propName in this.field) {
      return this.field[propName];
    }
    if (
      this.formCollection.fieldBaseParams.has(this.name) &&
      propName in this.formCollection.fieldBaseParams.get(this.name)
    ) {
      return this.formCollection.fieldBaseParams.get(this.name)[propName];
    }
    return undefined;
  }

  get isRequired() {
    return this._blend('isRequired');
  }

  get order() {
    return this._blend('order');
  }

  get label() {
    return this._blend('label');
  }
}
