import type { IterFn } from '../../types/types.shared';
import { Collection } from '../Collection';
import type { CollectionParams } from '../Collection';
export declare function noSet(): void;
export default class MapCollection<KeyType = unknown, ValueType = unknown> extends Collection<Map<KeyType, ValueType>> {
    constructor(name: string, params: CollectionParams<Map<KeyType, ValueType>>);
    set(key: KeyType, value: ValueType): void;
    delete(key: KeyType): void;
    deleteMany(keys: KeyType[]): void;
    get(key: KeyType): ValueType | undefined;
    replace(map: Map<KeyType, ValueType>): void;
    clear(): void;
    get size(): number;
    forEach(iter: IterFn<KeyType, ValueType>): void;
    keys(): {
        [Symbol.iterator]: () => Generator<KeyType, void, unknown>;
    };
    values(): {
        [Symbol.iterator]: () => Generator<ValueType, void, unknown>;
    };
}