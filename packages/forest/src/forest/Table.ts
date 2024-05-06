import {
  CrudEnum,
  ForestIF,
  Records,
  Scalar,
  TableChange,
  TableChangeField,
  TableIF,
  TableName,
} from './types';
import { c } from '@wonderlandlabs/collect';
import { isTableChangeField } from './helpers';

export default class Table<IdType extends Scalar, ValueType>
implements TableIF<IdType, ValueType>
{
  stack: Records<IdType, ValueType>[] = [];

  constructor(
    private forest: ForestIF,
    public name: TableName,
    values: Map<IdType, ValueType>
  ) {
    this.stack.push(values);
  }

  /**
   * clones data to a time index
   * @param index
   */
  atTime(index: number) {
    if (this.stack[index]) {
      throw new Error(
        'Cannot redefine stack ' + index + ' of table ' + this.name
      );
    }
    this.stack[index] = new Map(this.current);
  }

  /**
   * alter the stack head collection.
   * THIS SHOULD ONLY BE DONE BY FOREST CLASSES - NEVER FROM THE OUTSIDE.
   * @param {TableChange} change
   */
  change(change: TableChange) {
    if (isTableChangeField(change)) {
      this._changeField(change);
    }

    console.error('bad TableChange for table', this, ':', change);
    throw new Error('cannot interpret TableChange');
  }

  _changeField(change: TableChangeField) {
    const record = this.get(change.id as IdType);
    const coll = c(record).clone();
    switch (change.action) {
    case CrudEnum.CRUD_ADD:
      coll.set(change.field, change.value);
      break;
    case CrudEnum.CRUD_CHANGE:
      if (!coll.hasKey(change.field)) {
        throw new Error(
          'cannot change a field that is not in the record with "CRUD_CHANGE" method'
        );
      }
      break;
    case CrudEnum.CRUD_DELETE:
      if (coll.hasKey(change.field)) {
        coll.deleteKey(change.field); // not having it in the first place is not an error
      }
      break;
    default:
      throw new Error('cannot process change action ' + change.action);
    }

    this.set(change.id as IdType, coll.value);
  }

  get current() {
    if (!this.stack.length) {
      throw new Error('table cannot be empty');
    }
    return this.stack[this.stack.length - 1];
  }

  get currentIndex() {
    return this.stack.length - 1;
  }

  delete(key: IdType): boolean {
    if (!this.has(key)) {
      return false;
    }
    const next: Map<IdType, ValueType> = new Map(this.current);
    next.delete(key);
    this.stack.push(next);
    return true;
  }

  has(id: IdType): boolean {
    return this.current.has(id);
  }

  /**
   * updates the entire record for a single ID.
   * this is an external command sugar for a TableChangeField command
   * @param id
   * @param value
   */
  set(id: IdType, value: ValueType): void {
    this.forest.change([
      {
        table: this.name,
        id,
        value,
        action: this.has(id) ? CrudEnum.CRUD_CHANGE : CrudEnum.CRUD_ADD,
      },
    ]);
  }

  get(id: IdType): ValueType {
    if (!this.has(id)) {
      throw new Error(`Cannot get undefined key value for ${String(id)}`);
    }
    return this.current.get(id)!;
  }
}
