import { isChangeIF } from "./isChangeIF";
import { ChangeDel } from "../types";
import { Change_s } from "./enums";

export function isTreeDel(a: unknown): a is ChangeDel {
  if (!isChangeIF(a)) {
    return false;
  }
  return a.type === Change_s.del;
}
