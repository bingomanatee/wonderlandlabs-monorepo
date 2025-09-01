import { Store } from './Store';
import {
  ActionMethodRecord,
  ActionRecord,
  Path,
  StoreParams,
  StoreBranch,
} from '../types';
import { Subject } from 'rxjs';
import { pathString } from '../lib/combinePaths';
import { produce } from 'immer';
import { ForestBranch } from './ForestBranch';
import { setPath } from '../lib/path';

export class Forest<DataType, Actions extends ActionRecord = ActionRecord>
  extends Store<DataType, Actions>
  implements StoreBranch<DataType, Actions>
{
  constructor(p: StoreParams<DataType>) {
    super(p);
    this.root = this;
  }

  path: Path = [];

  root: StoreBranch<unknown>;
  isRoot = true;
  parent?: StoreBranch<unknown> = null;

  public broadcast(message: unknown, fromRoot?: boolean) {
    if (fromRoot || this.isRoot) {
      this.receiver.next(message);
    }
    if (this.parent) {
      this.parent.broadcast(message);
    }
  }

  public receiver = new Subject();

  set(value: unknown, path: Path): boolean {
    const pathArray = Array.isArray(path) ? path : pathString(path).split('.');
    const newValue = produce(this.value, (draft) => {
      // Use Immer to safely set nested values
      setPath(draft, pathArray, value);
    });
    return this.next(newValue);
  }

  branch<DataType, Actions extends ActionRecord = ActionRecord>(
    path: Path,
    actions: ActionMethodRecord,
  ) {
    const name = this.name + '.' + pathString(path);
    return new ForestBranch<DataType, Actions>(
      {
        name,
        actions,
      },
      path,
      this,
    );
  }
}
