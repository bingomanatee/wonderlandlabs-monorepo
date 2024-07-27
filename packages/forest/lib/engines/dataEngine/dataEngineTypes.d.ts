import { KeyVal } from "../../types";
export type SingleDel = {
    delKey: unknown;
};
export type MultiDel = {
    delKeys: unknown[];
};
export declare function isMultiDel(a: unknown): a is MultiDel;
export declare function isSingleDel(a: unknown): a is SingleDel;
export type DelVal = SingleDel | MultiDel;
export declare function isDel(a: unknown): a is DelVal;
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
export type DistMapManifest = DistMapManifestSet | DistMapManifestPatch | DistMapManifestDel;
