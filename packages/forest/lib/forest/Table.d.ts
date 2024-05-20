import { ForestIF, Records, Scalar, TableChange, TableChangeField, TableChangeValue, TableConfigIF, TableIF, TableName } from './types';
export default class Table<IdType extends Scalar, ValueType> implements TableIF<IdType, ValueType> {
    private forest;
    name: TableName;
    private config?;
    stack: Records<IdType, ValueType>[];
    constructor(forest: ForestIF, name: TableName, config?: TableConfigIF<IdType, ValueType> | undefined);
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
    _changeRecord(change: TableChangeValue): void;
    _dirtyIDs: Set<IdType>[];
    validate(): void;
    _validateRecord(id: IdType): void;
    _changeValue(id: IdType, value: ValueType): void;
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
