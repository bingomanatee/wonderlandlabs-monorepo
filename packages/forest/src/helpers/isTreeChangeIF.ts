import { isObj } from "./isObj";
import { isString } from "./isString";
import { TreeChangeBase, isBranchChangeType } from "../types";

export function isTreeChangeIF(arg: unknown): arg is TreeChangeBase<unknown, unknown> {
    if (!isObj(arg)) return false;
    const o = arg as Record<string, unknown>;

    if (!isBranchChangeType(o.type)) return false;
    return ('k' in o || 'v' in o || 'm' in o || isString(o.m));

}
