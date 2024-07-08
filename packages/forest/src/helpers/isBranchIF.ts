import { DataIF, ForestIF, LeafIdentityIF, TreeIF } from "../types";
import { isObj } from "./isObj";
import { isString } from "./isString";

export function isDataIF(a: unknown): a is DataIF {
  if (!isObj(a)) {
    return false;
  }
  const o = a as object;
  return "leaf,get,has,set,del,change"
    .split(",")
    .every((key: string) => key in o);
}

export function isForestIF(a: unknown): a is ForestIF {
  if (!isObj(a)) {
    return false;
  }
  const o = a as object;
  return (
    "tree" in o &&
    typeof o.tree === "function" &&
    "has,hasAll,hasree,currentScope".split(",").every((key: string) => key in a)
  );
}

export function isTreeIF(a: unknown): a is TreeIF {
  if (!isObj(a)) {
    return false;
  }
  const o = a as object;
  return "name" in o && "forest" in o && isDataIF(o) && isForestIF(o.forest);
}

export function isBranchIF(a: unknown): a is LeafIdentityIF {
  if (!isObj(a)) {
    return false;
  }
  const o = a as object;
  return "treeName" in o && isString(o.treeName) && "key" in o && "val" in o;
}
