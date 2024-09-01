import { Forest } from "../../Forest";
import type { CollectionIF } from "../../type.collection";
import type { ChangeFN } from "../../types.branch";
import type { ForestIF } from "../../types.forest";
import type { SubscribeFn } from "../../types.shared";
import { BehaviorSubject } from "rxjs";
import type { SubjectLike, PartialObserver, Unsubscribable } from "rxjs";
import type {
  FieldList,
  FieldRecord,
  FormSetIF,
  Params,
  PropMap,
  FieldProps,
  FormIF,
  FieldIF,
} from "./types.formCollection";
import {
  isFieldList,
  isFieldRecord,
  isFieldValue,
} from "./types.formCollection";
import { FormFieldMapCollection } from "./FormFieldMapCollection";

type FieldDef = FieldList | FieldRecord;

class FormCollection implements CollectionIF<FormSetIF> {
  constructor(public name: string, fields: FieldDef, private params?: Params) {
    this.forest = params?.forest ?? new Forest();
    this.initFields(fields);
    this.initForm(params?.form);
  }

  private _staticProps?: PropMap;

  public get staticProps(): PropMap {
    if (!this._staticProps) {
      this._staticProps = new Map<string, FieldProps>();
    }
    return this._staticProps;
  }

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
      staticProps: FieldProps | undefined,
      rest: Partial<FieldIF>
    ) => {
      const field: FieldIF = { name, value, ...rest };
      if (staticProps) {
        this.staticProps.set(name, staticProps);
      }
      fieldMap.set(name, field);
    };
    if (isFieldList(fields)) {
      for (const { name, staticProps, value, ...rest } of fields) {
        add(name, value, staticProps, rest);
      }
    } else if (isFieldRecord(fields)) {
      const keys = Object.keys(fields);
      for (const key of keys) {
        const record: Partial<FieldIF> = fields[key];
        const { staticProps, value, ...rest } = record;
        if (!isFieldValue(value)) throw new Error("bad field value");
        add(key, value, staticProps, rest);
      }
    }
    this.fieldMap = fieldMap;
  }

  private _fieldMapCollection?: FormFieldMapCollection;
  private makeFieldMapCollection() {
    const name = this.forest.uniqueTreeName(this.name + ":fields");
    this._fieldMapCollection = new FormFieldMapCollection(
      name,
      this.fieldMap,
      this
    );
  }

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
    return {
      form: this.form,
      fields: this.fieldMap,
    };
  }

  private _stream?: SubjectLike<FormSetIF>;

  private get stream() {
    if (!this._stream) {
      this._stream = new BehaviorSubject({
        fields: this.fieldMap,
        form: this.form,
      });
    }
    return this._stream!;
  }
  // @s-expect-error TS2416
  subscribe(observer: PartialObserver<FormSetIF> | SubscribeFn<FormSetIF>) {
    if (typeof observer === "function") observer = { next: observer };
    // @s-expect-error TS2416
    return this.stream.subscribe(observer) as Unsubscribable;
  }

  mutate<SeedType = unknown, RestType = unknown>(
    next: ChangeFN<FormSetIF>,
    seed?: SeedType,
    ...rest: RestType[]
  ) {
    throw new Error("not implemented");
    return this;
  }

  next(next: FormSetIF): CollectionIF<FormSetIF> {
    throw new Error("not implemented");
    return this;
  }
}
