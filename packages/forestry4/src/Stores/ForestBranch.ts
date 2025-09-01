import {
  ActionRecord,
  Listener,
  Path,
  StoreParams,
  StoreBranch,
} from '../types';
import { Store } from './Store';
import { isStore } from '../typeguards';
import { get, isEqual } from 'lodash-es';
import combinePaths, { pathString } from '../lib/combinePaths';
import { map, Subject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { produce } from 'immer';
import { getPath, setPath } from '../lib/path';

/**
 * ForestBranch is a shard store for a forest;
 * it cannot be the root and it always must have parent and path.
 */
export class ForestBranch<DataType, Actions extends ActionRecord = ActionRecord>
  extends Store<DataType, Actions>
  implements StoreBranch<DataType, Actions>
{
  constructor(
    p: Omit<StoreParams<DataType>, 'value'>,
    public readonly path: Path,
    public readonly parent: StoreBranch<unknown>,
  ) {
    super({ ...p, value: getPath(parent.value, path) as DataType }, true);
    if (!isStore(parent)) {
      throw new Error('ForestTrees must have parents');
    }
  }

  get root() {
    let root = this.parent;
    while (!root.isRoot && root.parent) {
      root = root.parent;
    }
    return root;
  }

  get isRoot() {
    return !this.parent;
  }

  next(value: unknown): boolean {
    this.parent.set(value, this.path);
    return true;
  }

  get value() {
    return get(this.parent?.value, pathString(this.path));
  }

  get subject() {
    const path = pathString(this.path);
    return this.parent.subject.pipe(
      map((value) => get(value, path)),
      distinctUntilChanged(isEqual),
    );
  }

  subscribe(listener: Listener<DataType>) {
    return this.subject.subscribe(listener);
  }

  set(value: unknown, path: Path): boolean {
    if (this.parent) {
      const deepPath = combinePaths(this.path, path);
      return this.parent.set(value, deepPath);
    } else {
      // should be in Forest class instance but just in case:
      // Use Immer to create immutable update
      const pathArray = Array.isArray(path)
        ? path
        : pathString(path).split('.');
      const newValue = produce(this.value, (draft) => {
        setPath(draft, pathArray, value);
      });
      return this.next(newValue);
    }
  }

  public receiver = new Subject();

  public broadcast(message: unknown, fromRoot?: boolean) {
    if (fromRoot || this.isRoot) {
      this.receiver.next(message);
    } else if (this.parent) {
      this.parent.broadcast(message);
    } else {
      console.warn(
        'strange broadcast pattern; node that is not root has no parent',
      );
    }
  }

  branch<DataType, Actions extends ActionRecord = ActionRecord>(
    path: Path,
    actions: Actions,
  ) {
    const mergedPath = combinePaths(this.path, path);
    return this.root.branch<DataType, Actions>(mergedPath, actions);
  }
}
