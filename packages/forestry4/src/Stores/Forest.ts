import { Store } from './Store';
import { ActionRecord, Listener, Path, StoreParams, StoreTree } from '../types';
import { map, Subject } from 'rxjs';
import { isStore } from '../typeguards';
import { cloneDeep, get, set } from 'lodash-es';
import combinePaths, { pathString } from '../lib/combinePaths';

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

/**
 * ForestTree is a shard store for a forest;
 * it cannot be the root and it always must have parent and path.
 */
export class ForestTree<DataType, Actions extends ActionRecord = ActionRecord>
  extends Store<DataType, Actions>
  implements StoreTree<DataType, Actions>
{
  constructor(
    p: StoreParams<DataType>,
    public readonly path: Path,
    public readonly parent: StoreTree<unknown>,
  ) {
    super(p, true);
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
    return this.parent.subject.pipe(map((value) => get(value, path)));
  }

  subscribe(listener: Listener<DataType>) {
    return this.subject.subscribe(listener);
  }

  set(value: unknown, path: Path) {
    // @TODO check path integrity
    if (this.parent) {
      const deepPath = combinePaths(this.parent.path, path);
      this.parent.set(value, deepPath);
      return true;
    } else {
      // should be in Forest class instance but just in case:
      const target = cloneDeep(this.value);
      const updated = set(
        target as object,
        pathString(path),
        value,
      ) as DataType;
      return this.next(updated);
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
}
