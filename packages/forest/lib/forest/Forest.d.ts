import { ForestIF, DataChange, TableIF, TableName, ChangeItem, Scalar, Records } from './types';
export default class Forest implements ForestIF {
    get tables(): Map<string, TableIF<Scalar, unknown>>;
    log: DataChange[];
    private _publicTables;
    private _time;
    get time(): number;
    addTable(name: TableName, values: Records): TableIF<Scalar, unknown>;
    has(name: TableName): boolean;
    private _advanceTime;
    /**
     * adds a pending change to the change log. Any number of actions can be combined in a single "atomic" action;
     * @TODO: validate changes, change state
     * @param changes
     */
    change(changes: ChangeItem[]): boolean;
}
