import type { CollectionIF } from '../../types/type.collection';
import { Collection } from '../Collection';
// import { map } from 'rxjs';

import type { FieldMap, FormCollectionIF } from './types.formCollection';
import extendField from './extendField';
import { canProxy } from '../../utils';
import { fieldMapSetValueProxy } from './fieldMapSetValueProxy';

/**
 * this is a "utility sub-class" of FormCollection designed exclusively
 * to track the field properties of FormCollection's fields.
 *
 * As it encases all values in a FieldExtended instance,
 * its designed to augment the subject by a "mapped map" of its sourced
 * values, allowing for the initial statics and validators to
 * provide defaults for the transient properties.
 */
export class FormFieldMapCollection
  extends Collection<FieldMap>
  implements CollectionIF<FieldMap>
{
  constructor(
    public name: string,
    fields: FieldMap,
    private formCollection: FormCollectionIF
  ) {
    const mappedFields = new Map();

    for (const [ name, field ] of fields) {
      if (field.baseParams) {
        formCollection.fieldBaseParams.set(name, field.baseParams);
        delete field.baseParams;
      }
      mappedFields.set(
        name,
        extendField(field, formCollection.fieldBaseParams.get(name))
      );
    }

    super(
      name,
      {
        initial: mappedFields,
      },
      formCollection.forest
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
    const map = this.tree.top.value;
    if (!map.has(name)) {
      throw new Error('FormFieldMapCollection does not have a field ' + name);
    }
    if (map.get(name).value === value) {
      return;
    } // unchanged value;

    const basis = this.formCollection.fieldBaseParams.get(name);
    // if we can use proxies, make a proxy of the map that returns a copy of the named field
    // with a different value for the name field
    // without exploding memory with duplicate maps all over the place.
    if (canProxy) {
      const next = fieldMapSetValueProxy(map, name, value, basis);
      this.next(next, 'setFieldValue');
    } else {
      const prev = map.get(name);
      if (!prev) {
        throw new Error('cannot get ' + name);
      } // typescriptism

      const next = extendField({ name, value }, prev, basis);

      const newMap = new Map(map);

      newMap.set(name, next);
      this.next(newMap, 'setFieldValue');
    }
  }
}
