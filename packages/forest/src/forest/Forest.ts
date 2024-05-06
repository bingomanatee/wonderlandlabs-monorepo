import {
  ForestIF,
  DataChange,
  TableIF,
  TableName,
  ChangeItem,
  Scalar,
  Records,
} from './types';
import Table from './Table';
import { isForestChange, isTableChangeBase } from './helpers';

export default class Forest implements ForestIF {
  get tables() {
    return this._publicTables;
  }

  log: DataChange[] = [];
  private _publicTables: Map<TableName, TableIF<Scalar, unknown>> = new Map();
  private _time = 0;

  get time() {
    return this._time;
  }

  addTable(name: TableName, values: Records): TableIF<Scalar, unknown> {
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

  private _advanceTime() {
    const nextTime = this._time + 1;
    this._time = nextTime;
  }

  /**
   * adds a pending change to the change log. Any number of actions can be combined in a single "atomic" action;
   * @TODO: validate changes, change state
   * @param changes
   */
  change(changes: ChangeItem[]): boolean {
    this._advanceTime();
    const changeSet = new ChangeSet(this, this.time, changes);
    this.log.push(changeSet);
    changeSet.perform();
    return true;
  }
}

class ChangeSet implements DataChange {
  constructor(
    private forest: ForestIF,
    public readonly time: number,
    public readonly changes: ChangeItem[]
  ) {}

  private _changedTables = new Map();

  public perform() {
    this.changes.forEach((change) => {
      if (isTableChangeBase(change)) {
        const table = this.forest.tables.get(change.table)!;
        table.atTime(this.time);
        table.change(change);
      }
      if (isForestChange(change)) {
        throw new Error('not implemented');
      }
    });
  }
}
