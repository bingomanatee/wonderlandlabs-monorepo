import type {
  FieldMap,
  FormCollectionIF,
  FieldIF,
  FieldMutatorFN,
  FieldProps,
} from './types.formCollection';
import extendField from './extendField';
import { MapCollection } from './../MapCollection/MapCollection';
import type { CollectionIF } from './../../types/types.collections';

/**
 * this is a "utility sub-class" of FormCollection designed exclusively
 * to track the field properties of FormCollection's fields.
 *
 * As it encases all values in a FieldExtended instance,
 * its designed to augment the $subject by a "mapped map" of its sourced
 * values, allowing for the initial statics and validators to
 * provide defaults for the transient properties.
 */
export class FormFieldMapCollection
  extends MapCollection<string, FieldIF>
  implements CollectionIF<Map<string, FieldIF>>
{
  constructor(
    public name: string,
    fields: FieldMap,
    private formCollection: FormCollectionIF,
  ) {
    const mappedFields = new Map();

    for (const [name, field] of fields) {
      if (field.baseParams) {
        formCollection.fieldBaseParams.set(name, field.baseParams);
        delete field.baseParams;
      }
      mappedFields.set(
        name,
        extendField(field, formCollection.fieldBaseParams.get(name)),
      );
    }

    super(
      name,
      {
        initial: mappedFields,
      },
      {},
      formCollection.forest,
    );
  }

  /**
   * sets (adds or updates) the value for a keyed item
   * @param {KeyType} name
   * @param {ValueType} value
   * @returns
   */
  setFieldValue(name: string, value: string | number) {
    if (!this.tree.top) {
      throw new Error('canot setFieldValue to empty FormFieldMapCollection');
    }
    if (!this.tree.top.value.has(name)) {
      throw new Error('no ' + name + ' in form');
    }

    const field = this.get(name);
    const basis = this.formCollection.fieldBaseParams.get(name) ?? {};
    const newField = extendField({ value, edited: true }, field, basis);
    this.set(name, newField);
  }

  updateFieldProperty(name: string, key: string, value: any) {
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
    const newField = extendField({ [key]: value }, field, basis);
    this.set(name, newField);
  }

  /**
   * update a field parametrically with a mutation function
   *
   * @param name string
   * @param mutator (field) => field
   */
  updateField(name: string, mutator: FieldMutatorFN) {
    if (!this.tree.top) {
      throw new Error('canot setFieldValue to empty FormFieldMapCollection');
    }
    if (!this.tree.top.value.has(name)) {
      throw new Error('no ' + name + ' in form');
    }

    const field = this.get(name);
    const updatedField = mutator(field, this.formCollection);
    const basis = this.formCollection.fieldBaseParams.get(name) ?? {};
    const newField = extendField(updatedField, basis);
    this.set(name, newField);
  }

  commit(name: string | true) {
    if (name === true) {
      const self = this;
      this.forest.do(() => {
        for (const fieldName of self.keys()) {
          this.updateFieldProperty(fieldName, 'committed', true);
        }
      });
    } else {
      this.updateFieldProperty(name, 'committed', true);
    }
  }

  updateFieldProps(name: string, props: FieldProps, propsToDelete?: string[]) {
    return this.updateField(
      name,
      (field: FieldIF, formCollection: FormCollectionIF) => {
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
      },
    );
  }
}
