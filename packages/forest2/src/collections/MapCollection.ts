import { Forest } from "../Forest";
import type { CollectionIF } from "../type.collection";
import type { IterFn, SubscribeFn } from "../types.shared";
import type { ForestIF } from "../types.forest";
import type { TreeIF, ValidatorFn } from "../types.trees";
import type { ChangeFN } from "../types.branch";
import type { PartialObserver } from "rxjs";
import { Collection } from "./Collection";
import type { CollectionParams } from "./Collection";
import { setProxy } from "./setProxy";

const m = new Map();

function* NullIterator<KeyType>(): IterableIterator<KeyType> {
  return { next: () => ({ done: true }) };
}

type MapIteratorFn<ValueType> = () => IterableIterator<ValueType>;

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
      const next = setProxy<KeyType, ValueType>(
        this.tree.top.value,
        key,
        value
      );
      this.tree.grow({ next });
    } else {
      this.tree.grow({ next: new Map([[key, value]]) });
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
}
