import type { ChangeFN } from "./types.branch";

export interface Mutator<ValueType> {
  next: ChangeFN<ValueType>;
  seed?: any;
  name?: string;
}

export function isMutator<ValueType>(a: unknown): a is Mutator<ValueType> {
  return !!(
    a &&
    typeof a === "object" &&
    "next" in a &&
    typeof a.next === "function"
  );
}
interface Assertion<ValueType> {
  next: ValueType;
  name?: string;
}
export type ChangeIF<ValueType> = Mutator<ValueType> | Assertion<ValueType>;
export type SubscribeFn<ValueType> = (next: ValueType) => any;

export type IterFn<KeyType, ValueType> = (v: ValueType, k: KeyType) => void