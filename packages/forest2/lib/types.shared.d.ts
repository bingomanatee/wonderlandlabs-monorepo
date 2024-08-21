import type { ChangeFN } from "./types.branch";
export interface Mutator<ValueType> {
    next: ChangeFN<ValueType>;
    seed?: any;
    name?: string;
}
export declare function isMutator<ValueType>(a: unknown): a is Mutator<ValueType>;
interface Assertion<ValueType> {
    next: ValueType;
    name?: string;
}
export type ChangeIF<ValueType> = Mutator<ValueType> | Assertion<ValueType>;
export {};
