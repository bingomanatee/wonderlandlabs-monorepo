import { ForestIF, Records, Scalar, TableChange, TableChangeField, TableIF, TableName } from './types';
export default class Table<IdType extends Scalar, ValueType> implements TableIF<IdType, ValueType> {
    private forest;
    name: TableName;
    stack: Records<IdType, ValueType>[];
    constructor(forest: ForestIF, name: TableName, values: Map<IdType, ValueType>);
    /**
     * clones data to a time index
     * @param index
     */
    atTime(index: number): void;
    /**
     * alter the stack head collection.
     * THIS SHOULD ONLY BE DONE BY FOREST CLASSES - NEVER FROM THE OUTSIDE.
     * @param {TableChange} change
     */
    change(change: TableChange): void;
    _changeField(change: TableChangeField): void;
    get current(): Records<IdType, ValueType>;
    get currentIndex(): number;
    delete(key: IdType): boolean;
    has(id: IdType): boolean;
    /**
     * updates the entire record for a single ID.
     * this is an external command sugar for a TableChangeField command
     * @param id
     * @param value
     */
    set(id: IdType, value: ValueType): void;
    get(id: IdType): ValueType;
}
