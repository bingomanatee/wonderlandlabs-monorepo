import type { ForestIF } from '../../types/types.forest';
import type { IterFn, ValueProviderParams } from '../../types/types.shared';
import { canProxy } from '../../canProxy';
import { Collection } from '../Collection';
import { deleteObjectProxyFor } from './deleteObjectProxyFor';
import { setObjectProxyFor } from './setObjectProxyFor';
import { TreeParams } from '../../types/types.trees';
import { isObj } from '../../types/types.guards';
import { patchObjectProxyFor } from './patchObjectProxyFor';

export class ObjectCollection<
  KeyType extends keyof any = string,
  ValueType = unknown,
> extends Collection<Record<KeyType, ValueType>> {
  constructor(
    name: string,
    params: TreeParams<Record<KeyType, ValueType>>,
    actions,
    forest?: ForestIF,
  ) {
    function objectCloner(
      cloneParams: ValueProviderParams<Record<KeyType, ValueType>>,
    ): Record<KeyType, ValueType> {
      const { value } = cloneParams;

      if (!isObj(value)) throw new Error('attempting to clone non-object');

      return { ...value } as Record<KeyType, ValueType>;
    }

    super(
      name,
      {
        ...params,
        benchmarkInterval: params.benchmarkInterval ?? 20,
        serializer: params.serializer ?? objectCloner,
      },
      actions,
      forest,
    );
  }

  has(key: KeyType) {
    if (!this.value) {
      return false;
    }
    return key in this.value;
  }

  set(key: KeyType, value: ValueType) {
    if (this.tree.top) {
      if (canProxy) {
        const next = setObjectProxyFor<KeyType, ValueType>({
          object: this.tree.top.value,
          key,
          value,
        });
        this.tree.next(next, 'set');
      } else {
        const next = { ...this.tree.top.value, [key]: value };
        this.tree.next(next, 'set');
      }
    } else {
      // @ts-ignore
      this.tree.next({ [key]: value }, 'set');
    }
  }

  delete(key: KeyType) {
    return this.deleteMany([key]);
  }

  deleteMany(keys: KeyType[]) {
    if (!this.tree.top) {
      return;
    }
    if (canProxy) {
      const next = deleteObjectProxyFor<KeyType, ValueType>({
        object: this.tree.top.value,
        keys,
      });

      this.tree.next(next, 'deleteMany');
    } else {
      const next = { ...this.tree.top.value };
      for (const key of keys) {
        delete next[key];
      }
      this.tree.next(next, 'deleteMany');
    }
  }

  get(key: KeyType): ValueType | undefined {
    if (!this.tree.top) {
      return undefined;
    }
    return this.tree.top.value[key];
  }

  clear() {
    this.next({} as Record<KeyType, ValueType>);
  }

  get size() {
    if (!this.tree.top) {
      return 0;
    }
    return this.keys().length;
  }

  patch(patch: Record<KeyType, ValueType>) {
    if (this.tree.top) {
      if (canProxy) {
        const next = patchObjectProxyFor<KeyType, ValueType>({
          object: this.tree.top.value,
          patch,
        });
        this.tree.next(next, 'set');
      } else {
        const next = { ...this.tree.top.value, ...patch };
        this.tree.next(next, 'patch');
      }
    } else {
      // @ts-ignore
      this.tree.next({ [key]: value }, 'set');
    }
  }

  forEach(iter: IterFn<KeyType, ValueType>) {
    if (!this.tree.top) {
      return;
    }
    const value = { ...this.value };
    Object.keys(value).forEach((iterKey) => {
      const id = iterKey as KeyType;
      iter(value[id], id);
    });
  }

  keys() {
    return Object.keys(this.value);
  }

  values() {
    return Object.values(this.value);
  }
}
