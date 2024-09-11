import type { FieldIF } from "../collections/FormCollection/types.formCollection";
import type { Mutator } from "./types.shared";
import type { CachingParams } from "./types.trees";
export declare function isObj(a: unknown): a is object;
export declare function isField(a: unknown): a is FieldIF;
export declare function isMutator<ValueType>(a: unknown): a is Mutator<ValueType>;
export interface Assertion<ValueType> {
    next: ValueType;
    name: string;
}
export declare function hasCachingParams(a: unknown): a is CachingParams<unknown>;
export declare function isMapKey<MapType>(map: MapType, a: keyof any): a is keyof MapType;
