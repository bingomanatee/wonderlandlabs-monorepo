import { ActionIF, isObj } from "../../types";
import { DistributedMap } from "./DistributedMap";

export type SingleDel = { delKey: unknown };
export type MultiDel = { delKeys: unknown[] };

export function isMultiDel(a: unknown): a is MultiDel {
  return isObj(a) && "delKeys" in a;
}

export function isSingleDel(a: unknown): a is SingleDel {
  return isObj(a) && "delKey" in a;
}

export type DelVal = SingleDel | MultiDel;

export function isDel(a): a is DelVal {
  return isSingleDel(a) || isMultiDel(a);
}

export type DataEngineMap = Map<unknown, unknown>;

export type DataEngineAction = ActionIF & {
  map(map: DataEngineMap, forTarget: DistributedMap): DataEngineMap;
  get(key: unknown, forTarget: DistributedMap): unknown | undefined;
};
