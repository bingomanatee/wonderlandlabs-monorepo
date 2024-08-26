import type { IterFn } from "../types.shared";
import { Collection } from "./Collection";
import type { CollectionParams } from "./Collection";
import { deleteProxyFor } from "./deleteProxyFor";
import { setProxyFor } from "./setProxyFor";

export function isMapKey<MapType>(
  map: MapType,
  a: keyof any
): a is keyof MapType {
  if (a === Symbol.iterator) return true;
  // @ts-ignore 7052
  return map instanceof Map && a in map;
}

export function noSet() {
  throw new Error("forest maps are immutable");
}

export const canProxy = typeof Proxy === "function";
export default class MapCollection<
  KeyType = unknown,
  ValueType = unknown
> extends Collection<Map<KeyType, ValueType>> {
  constructor(name: string, params: CollectionParams<Map<KeyType, ValueType>>) {
    super(name, params);
  }

  set(key: KeyType, value: ValueType) {
    if (this.tree.top) {
      if (canProxy) {
        const next = setProxyFor<KeyType, ValueType>({
          map: this.tree.top.value,
          key,
          value,
        });
        this.tree.grow({ next });
      } else {
        let next = new Map(this.tree.top.value);
        next.set(key, value);
        this.tree.grow({ next });
      }
    } else {
      this.tree.grow({ next: new Map([[key, value]]) });
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
      const next = deleteProxyFor<KeyType, ValueType>({
        map: this.tree.top.value,
        keys,
      });

      this.tree.grow({ next });
    } else {
    const next = new Map(this.tree.top.value);
    for (const key of keys) next.delete(key);
    this.tree.grow({ next });

    }
  }

  get(key: KeyType): ValueType | undefined {
    if (!this.tree.top) {
      return undefined;
    }
    return this.tree.top.value.get(key);
  }

  get size() {
    if (!this.tree.top) return 0;
    return this.tree.top.value.size;
  }

  forEach(iter: IterFn<KeyType, ValueType>) {
    if (!this.tree.top) return;
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
