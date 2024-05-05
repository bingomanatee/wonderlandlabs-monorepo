import { ForestIF, TableChange, TableIF, TableName } from './types';
import Table from './Table';

export default class Forest implements ForestIF {
  get tables() {
    return this._publicTables;
  }

  log: TableChange[] = [];
  private _publicTables: Map<TableName, TableIF<unknown, unknown>> = new Map();

  addTable(
    name: TableName,
    values: Map<unknown, unknown>
  ): TableIF<unknown, unknown> {
    if (this.has(name)) {
      throw new Error('cannot add over existing table ' + name);
    }

    const table = new Table(this, name, values);
    this._publicTables.set(name, table);
    return table;
  }

  has(name: TableName): boolean {
    return this._publicTables.has(name);
  }
}
