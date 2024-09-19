import type { FieldIF } from '../collections/FormCollection/types.formCollection';
import type {
  Assertion,
  IttermittentCacheProviderParams,
  LocalValueProviderParams,
  MutationValueProviderParams,
  Mutator,
  TruncationValueProviderParams,
} from './types.shared';
import { ValueProviderContext } from './ValueProviderContext';

export function isObj(a: unknown): a is object {
  return Boolean(a && typeof a === 'object');
}

export function isField(a: unknown): a is FieldIF {
  if (!isObj(a)) {
    return false;
  }
  const o = a as object;

  return Boolean(
    'name' in o &&
      'value' in o &&
      typeof o.name === 'string' &&
      (typeof o.value === 'number' || typeof o.value === 'string')
  );
}

export function isMutator<ValueType = unknown>(
  a: unknown
): a is Mutator<ValueType> {
  if (!isObj(a)) {
    return false;
  }
  return !!(
    a &&
    typeof a === 'object' &&
    'mutator' in a &&
    typeof a.mutator === 'function'
  );
}

export function isAssert<ValueType = unknown>(
  a: unknown
): a is Assertion<ValueType> {
  if (!isObj(a)) {
    return false;
  }
  const o = a as Record<string | number | symbol, unknown>;
  return Boolean('assert' in o);
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

export function isMutationValueProviderParams<Value>(
  a: unknown
): a is MutationValueProviderParams<Value> {
  if (!isObj(a)) {
    return false;
  }
  return Boolean('context' in a && a.context === ValueProviderContext.mutation);
}

export function isLocalValueProviderParams<Value>(
  a: unknown
): a is LocalValueProviderParams<Value> {
  if (!isObj(a)) {
    return false;
  }
  return Boolean(
    'context' in a && a.context === ValueProviderContext.localCache
  );
}

export function isTruncationValueProviderParams<Value>(
  a: unknown
): a is TruncationValueProviderParams<Value> {
  if (!isObj(a)) {
    return false;
  }
  return Boolean(
    'context' in a && a.context === ValueProviderContext.truncation
  );
}

export function isIttermittentCacheProviderParams<Value>(
  a: unknown
): a is IttermittentCacheProviderParams<Value> {
  if (!isObj(a)) {
    return false;
  }
  return Boolean(
    'context' in a && a.context === ValueProviderContext.itermittentCache
  );
}
