import { Forest } from "../../Forest";
import type { ForestIF } from "../../types.forest";
import type { SubscribeFn } from "../../types.shared";
import { BehaviorSubject, map } from "rxjs";
import type { SubjectLike, PartialObserver, Unsubscribable } from "rxjs";
import type {
  FieldList,
  FieldRecord,
  FormSetIF,
  Params,
  FormIF,
  FieldIF,
  FieldBase,
  BaseParamMap,
  FormCollectionIF,
  FieldMap,
} from "./types.formCollection";
import {
  isFieldList,
  isFieldRecord,
  isFieldValue,
} from "./types.formCollection";
import { FormFieldMapCollection } from "./FormFieldMapCollection";

type FieldDef = FieldList | FieldRecord;

export default class FormCollection implements FormCollectionIF {
  constructor(public name: string, fields: FieldDef, params?: Params) {
    this.forest = params?.forest ?? new Forest();
    this.initFields(fields);
    this.initForm(params?.form);
  }

  public fieldBaseParams: BaseParamMap = new Map();

  public forest: ForestIF;
  private fieldMap: Map<string, FieldIF> = new Map();

  /**
   * interprets fields into a fieldMap.
   * @param {FieldDef} fields
   */
  private initFields(fields: FieldDef) {
    const fieldMap = new Map<string, FieldIF>();
    const add = (
      name: string,
      value: string | number,
      baseParams: FieldBase | undefined,
      rest: Partial<FieldIF>
    ) => {
      const field: FieldIF = { name, value, ...rest };
      if (baseParams) {
        this.fieldBaseParams.set(name, baseParams);
      }
      fieldMap.set(name, field);
    };

    if (isFieldList(fields)) {
      for (const { name, baseParams: baseParams, value, ...rest } of fields) {
        add(name, value, baseParams, rest);
      }
    } else if (isFieldRecord(fields)) {
      const keys = Object.keys(fields);
      for (const key of keys) {
        const record: Partial<FieldIF> = fields[key];
        const { baseParams, value, ...rest } = record;
        if (!isFieldValue(value)) {
          throw new Error("bad field value");
        }
        console.log("adding", key, value, baseParams, rest);
        add(key, value, baseParams, rest);
      }
    } else {
      throw new Error("bad feilds type in FormCollection");
    }

    const fcName = this.forest.uniqueTreeName(this.name + ":fields");
    this.fieldMapCollection = new FormFieldMapCollection(
      fcName,
      fieldMap,
      this
    );

    console.log("fmc:", this.fieldMapCollection.value);
  }

  private fieldMapCollection: FormFieldMapCollection;

  // #region form

  private form: FormIF = {};
  private initForm(initialForm?: FormIF) {
    if (initialForm) {
      this.form = initialForm;
    }
  }
  // #endregion

  // region value, stream, next;
  public get value() {
    return this.stream.value;
  }

  private _stream?: BehaviorSubject<FormSetIF>;

  private get stream() {
    if (!this._stream) {
      this._stream = new BehaviorSubject({
        fields: this.fieldMapCollection.value,
        form: this.form,
      });
      // at this point we are assuming that the form is static;
      const self = this;
      this.fieldMapCollection.tree.subject // note - _fieldMapCollection is always instatntiated in the consctructor
        .pipe(map((fields: FieldMap) => ({ fields, form: self.form })))
        .subscribe(this._stream);
    }

    return this._stream!;
  }
  // @s-expect-error TS2416
  subscribe(observer: PartialObserver<FormSetIF> | SubscribeFn<FormSetIF>) {
    if (typeof observer === "function") {
      observer = { next: observer };
    }
    // @s-expect-error TS2416
    return this.stream.subscribe(observer) as Unsubscribable;
  }

  // the "standard mutators" are too gross for this use case

  setFieldValue(name: string, value: string | number) {
    this.fieldMapCollection?.setFieldValue(name, value);
  }

  get isValid(): boolean {
    for (const [, field] of this.fieldMapCollection.value) {
      if (field.errors?.length) {
        return false;
      }
    }
    return true;
  }
}
