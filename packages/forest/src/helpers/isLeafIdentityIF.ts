import { LeafIdentityIF } from "../types";
import { isObj } from "./isObj";
import { isString } from "./isString";

export function isLeafIdentityIF(a: unknown) : a is LeafIdentityIF {
    if (!isObj(a)) return false;
    const o = a as object;
    return  't' in o && isString(o.t) && 'k' in o;
}