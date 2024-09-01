import isEqual from "lodash.isequal";
import type {
  FieldIF,
  FormCollectionIF,
  FieldProps,
  FieldError,
  FieldValidator,
} from "./types.formCollection";

type MessyValidator = FieldValidator | undefined;
type MessyValidators = MessyValidator[];
const UNSET = Symbol("unset");
/**
 * FieldExtended blends the properties of the static props of the
 * transient field with the staticProps from the formCollection's map.
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

  get staticProps(): FieldProps | undefined {
    return this.formCollection.staticProps?.get(this.name);
  }

  private _props: FieldProps | undefined | symbol = UNSET;
  get props() {
    if (this._props === UNSET) {
      this._props = [this.staticProps, this.field.props].reduce(
        (out: FieldProps, item: FieldProps | undefined) => {
          if (item) {
            return { ...out, ...item };
          }
          return out;
        },
        {}
      );
    }
    return typeof this._props === "symbol" ? undefined : this._props;
  }

  private _validators: FieldValidator[] | undefined | symbol = UNSET;

  get validators() {
    if (this._validators === UNSET) {
      this._validators = [
        this.staticProps?.validators,
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
    let errors: FieldError[] = [];
    this.validators?.forEach((v: FieldValidator | undefined) => {
      if (v) {
        let err = v(this);
        if (err && !errors.some((e) => isEqual(e, err))) {
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

  get label() {
    if (this.field.label) return this.field.label;
    if (
      this.props &&
      "label" in this.props &&
      typeof this.props.label === "string"
    )
      return this.props.label;
    return undefined;
  }
}
