import { ForestIF, TableIF, TableName, TableValues } from './types';

export default class Table<KeyType, ValueType>
implements TableIF<KeyType, ValueType>
{
  constructor(
    private forest: ForestIF,
    public name: TableName,
    values: Map<KeyType, ValueType>
  ) {
    this.stack.push(values);
  }

  public stack: TableValues<KeyType, ValueType>[] = [];

  get current() {
    if (!this.stack.length) {
      throw new Error('table cannot be empty');
    }
    return this.stack[this.stack.length - 1];
  }

  get currentIndex() {
    return this.stack.length - 1;
  }

  delete(key: KeyType): boolean {
    if (!this.has(key)) {
      return false;
    }
    const next: Map<KeyType, ValueType> = new Map(this.current);
    next.delete(key);
    this.stack.push(next);
    return true;
  }

  has(key: KeyType): boolean {
    return false;
  }

  set(key: KeyType, value: ValueType): void {
    const next = new Map(this.current);
    next.set(key, value);
    this.stack.push(next);
  }

  get(key: KeyType): ValueType {
    if (!this.has(key)) {
      throw new Error('Cannot get undefined key value for ' + key);
    }
    return this.current.get(key)!;
  }
}
