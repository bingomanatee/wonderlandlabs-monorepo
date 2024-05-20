import { ChangeItem, DataChange, ForestIF } from './types';
import { isForestChange, isTableChangeBase } from './helpers';

export class ChangeSet implements DataChange {
  constructor(
    private forest: ForestIF,
    public readonly time: number,
    public readonly changes: ChangeItem[]
  ) {}

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
