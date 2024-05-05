import { ForestIF, TableIF, TableName, TableValues } from './types';
export default class Table<KeyType, ValueType> implements TableIF<KeyType, ValueType> {
    private forest;
    name: TableName;
    constructor(forest: ForestIF, name: TableName, values: Map<KeyType, ValueType>);
    stack: TableValues<KeyType, ValueType>[];
    get current(): TableValues<KeyType, ValueType>;
    get currentIndex(): number;
    delete(key: KeyType): boolean;
    has(key: KeyType): boolean;
    set(key: KeyType, value: ValueType): void;
    get(key: KeyType): ValueType;
}
