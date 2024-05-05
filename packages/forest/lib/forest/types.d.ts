export type TableName = string;
export interface TableIF<TableKey, TableValue> {
    name: TableName;
    get(key: TableKey): TableValue;
    set(key: TableKey, value: TableValue): void;
    has(key: TableKey): boolean;
    delete(key: TableKey): boolean;
    current: TableValues<TableKey, TableValue>;
    stack: TableValues<TableKey, TableValue>[];
    currentIndex: number;
}
export type TableValues<TableKey, TableValue> = Map<TableKey, TableValue>;
declare const CrudEnum: {
    CRUD_ADD: string;
    CRUD_CHANGE: string;
    CRUD_DELETE: string;
};
type CrudEnumKeys = keyof typeof CrudEnum;
type CRUD = typeof CrudEnum[CrudEnumKeys];
export type TableValueChange = {
    table: TableName;
    key: unknown;
    value: unknown;
    action: CRUD;
};
export type ForestChange = {
    table: TableName;
    action: CRUD;
    values?: Map<unknown, unknown>;
};
export type TableChangeChange = TableValueChange | ForestChange;
export interface TableChange {
    time: number;
    changes: TableChangeChange[];
}
/**
 * the "DATABASE" - includes external tables and "journal tables" that track and validate changes
 */
export interface ForestIF {
    tables: Map<TableName, TableIF<unknown, unknown>>;
    has(name: TableName): boolean;
    addTable(name: TableName, values: Map<unknown, unknown>): TableIF<unknown, unknown>;
    log: TableChange[];
}
export {};
