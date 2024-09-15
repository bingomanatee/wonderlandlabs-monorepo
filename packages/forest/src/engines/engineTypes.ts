import { MutatorIF, isObj, KeyVal } from "../types";

export type SingleDel = { delKey: unknown };
export type MultiDel = { delKeys: unknown[] };

export function isMultiDel(a: unknown): a is MultiDel {
  return isObj(a) && "delKeys" in a;
}

export function isSingleDel(a: unknown): a is SingleDel {
  return isObj(a) && "delKey" in a;
}

export type DelVal = SingleDel | MultiDel;

export function isDel(a: unknown): a is DelVal {
  return isSingleDel(a) || isMultiDel(a);
}

export type GenericMap = Map<unknown, unknown>;

export type DistMapManifestSet = {
  set: KeyVal;
};

export type DistMapManifestDel = {
  del: DelVal;
};

export type DistMapManifestPatch = {
  patch?: GenericMap;
};

export type DistMapManifest =
  | DistMapManifestSet
  | DistMapManifestPatch
  | DistMapManifestDel;
