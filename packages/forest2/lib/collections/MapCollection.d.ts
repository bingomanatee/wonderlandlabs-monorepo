import type { IterFn } from "../types.shared";
import { Collection } from "./Collection";
import type { CollectionParams } from "./Collection";
export declare function isMapKey<MapType>(map: MapType, a: keyof any): a is keyof MapType;
export declare function noSet(): void;
export declare const canProxy: boolean;
export default class MapCollection<KeyType = unknown, ValueType = unknown> extends Collection<Map<KeyType, ValueType>> {
    constructor(name: string, params: CollectionParams<Map<KeyType, ValueType>>);
    set(key: KeyType, value: ValueType): void;
    get(key: KeyType): ValueType | undefined;
    get size(): number;
    forEach(iter: IterFn<KeyType, ValueType>): void;
    keys(): () => Generator<"a" | "b", void, unknown>;
}