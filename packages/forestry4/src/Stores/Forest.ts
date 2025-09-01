import { Store } from './Store';
import { ActionRecord, Path, StoreParams, StoreTree } from '../types';
import { Subject } from 'rxjs';
import { cloneDeep, set } from 'lodash-es';
import { pathString } from '../lib/combinePaths';

export class Forest<DataType, Actions extends ActionRecord = ActionRecord>
  extends Store<DataType, Actions>
  implements StoreTree<DataType, Actions>
{
  constructor(p: StoreParams<DataType>) {
    super(p);
    this.root = this;
  }

  path: Path = [];

  root: StoreTree<unknown>;
  isRoot = true;
  parent?: StoreTree<unknown> = null;

  public broadcast(message: unknown, fromRoot?: boolean) {
    if (fromRoot || this.isRoot) {
      this.receiver.next(message);
    }
    if (this.parent) {
      this.parent.broadcast(message);
    }
  }

  public receiver = new Subject();

  set(value, path: Path) {
    // @TODO: handle "exotic type sets" for Map and Array
    const target = cloneDeep(this.value);
    const updated = set(target as object, pathString(path), value) as DataType;
    return this.next(updated);
  }
}
