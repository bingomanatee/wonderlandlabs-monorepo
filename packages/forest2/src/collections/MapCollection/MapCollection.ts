import { isMapIterator } from 'util/types';
import { hasCachingParams } from '../../types/types.guards';
import type { IterFn } from '../../types/types.shared';
import type { TreeIF } from '../../types/types.trees';
import { canProxy } from '../../utils';
import { Collection } from '../Collection';
import type { CollectionParams } from '../Collection';
import { deleteProxyFor } from './deleteProxyFor';
import { setProxyFor } from './setProxyFor';
import type { BranchIF } from '../../types/types.branch';

export function noSet() {
  throw new Error('forest maps are immutable');
}

export default class MapCollection<
  KeyType = unknown,
  ValueType = unknown
> extends Collection<Map<KeyType, ValueType>> {
  constructor(name: string, params: CollectionParams<Map<KeyType, ValueType>>) {
    type MapType = Map<KeyType, ValueType>;

    function mapCloner(t: TreeIF<MapType>, branch?: BranchIF<MapType>): MapType {
      const prevValue: MapType = branch? branch.value : t.value;
      if (!(prevValue instanceof Map)) {throw new Error('cannot clone map');}
      // @ts-expect-error 2769
      return new Map(...prevValue.entries()) as MapType;
    }

    if (!hasCachingParams) {
      {
        super(name, { ...params, cloneInterval: 5, cloner: mapCloner });
      }
    } else {
      super(name, { ...params, cloner: mapCloner });
    }
  }

  set(key: KeyType, value: ValueType) {
    if (this.tree.top) {
      if (canProxy) {
        const next = setProxyFor<KeyType, ValueType>({
          map: this.tree.top.value,
          key,
          value,
        });
        this.tree.next(next, 'set');
      } else {
        const next = new Map(this.tree.top.value);
        next.set(key, value);
        this.tree.next(next, 'set');
      }
    } else {
      this.tree.next(new Map([ [ key, value ] ]), 'set');
    }
  }

  delete(key: KeyType) {
    return this.deleteMany([ key ]);
  }

  deleteMany(keys: KeyType[]) {
    if (!this.tree.top) {
      return;
    }
    if (canProxy) {
      const next = deleteProxyFor<KeyType, ValueType>({
        map: this.tree.top.value,
        keys,
      });

      this.tree.next(next, 'deleteMany');
    } else {
      const next = new Map(this.tree.top.value);
      for (const key of keys) {
        next.delete(key);
      }
      this.tree.next(next, 'deleteMany');
    }
  }

  get(key: KeyType): ValueType | undefined {
    if (!this.tree.top) {
      return undefined;
    }
    return this.tree.top.value.get(key);
  }

  replace(map: Map<KeyType, ValueType>) {
    this.tree.next(map, 'replace');
  }

  clear() {
    this.replace(new Map());
  }

  get size() {
    if (!this.tree.top) {
      return 0;
    }
    return this.tree.top.value.size;
  }

  forEach(iter: IterFn<KeyType, ValueType>) {
    if (!this.tree.top) {
      return;
    }
    this.tree.top.value.forEach(iter);
  }

  keys() {
    const tree = this.tree;
    return {
      [Symbol.iterator]: function* () {
        if (tree.top) {
          for (const out of tree.top.value.keys()) {
            yield out as KeyType;
          }
        }
      },
    };
  }

  values() {
    const tree = this.tree;
    return {
      [Symbol.iterator]: function* () {
        if (tree.top) {
          for (const out of tree.top.value.values()) {
            yield out as ValueType;
          }
        }
      },
    };
  }
}
