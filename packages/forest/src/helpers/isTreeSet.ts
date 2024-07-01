import { isTreeChangeIF } from "./isTreeChangeIF";
import { TreeSet, BranchChangeTypeEnum } from "./../types";

export function isTreeSet(a: unknown): a is TreeSet {
    if (!isTreeChangeIF(a)) return false;
    return a.type === BranchChangeTypeEnum.set;
}
