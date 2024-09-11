import type {
  FieldIF,
  FieldValue,
} from "../collections/FormCollection/types.formCollection";
import type { Mutator } from "./types.shared";
import type { CachingParams } from "./types.trees";

export function isObj(a: unknown): a is object {
  return Boolean(a && typeof a === "object");
}

export function isField(a: unknown): a is FieldIF {
  if (!isObj(a)) {
    return false;
  }
  const o = a as object;

  return Boolean(
    "name" in o &&
      "value" in o &&
      typeof o.name === "string" &&
      (typeof o.value === "number" || typeof o.value === "string")
  );
}

export function isMutator<ValueType>(a: unknown): a is Mutator<ValueType> {
  return !!(
    a &&
    typeof a === "object" &&
    "mutator" in a &&
    typeof a.mutator === "function"
  );
}
export interface Assertion<ValueType> {
  next: ValueType;
  name: string;
}

export function hasCachingParams(a: unknown): a is CachingParams<unknown> {
  if (!isObj(a)) return false;
  const o = a as Record<string, any>;

  if (!("cloner" in o && "cloneInterval" in o)) return false;

  return typeof o.cloner === "function" && typeof o.cloneInterval === "number";
}
export function isMapKey<MapType>(
  map: MapType,
  a: keyof any
): a is keyof MapType {
  if (a === Symbol.iterator) {
    return true;
  }
  // @ts-ignore 7052
  return map instanceof Map && a in map;
}
