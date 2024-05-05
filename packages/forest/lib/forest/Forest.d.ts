import { ForestIF, TableChange, TableIF, TableName } from './types';
export default class Forest implements ForestIF {
    get tables(): Map<string, TableIF<unknown, unknown>>;
    log: TableChange[];
    private _publicTables;
    addTable(name: TableName, values: Map<unknown, unknown>): TableIF<unknown, unknown>;
    has(name: TableName): boolean;
}
