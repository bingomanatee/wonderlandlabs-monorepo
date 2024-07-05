import { isChangeIF } from "./isChangeIF";
import { ChangeSet } from "./../types";
import { Change_s } from "./enums";

export function isTreeSet(a: unknown): a is ChangeSet {
  if (!isChangeIF(a)) {
    return false;
  }
  return a.type === Change_s.set;
}
