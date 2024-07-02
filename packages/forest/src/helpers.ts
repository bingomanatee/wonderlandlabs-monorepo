import { DELETED, NOT_FOUND } from "./constants";


export function mp(...args: unknown[]): Map<unknown, unknown> {
    let e: [unknown, unknown][] = [];
    while (args.length > 1) {
        //@ts-ignore
        e.push(args.splice(0, 2));
    }
    return new Map(e);
}

export function nf(val: unknown) {
    if (val === DELETED) return NOT_FOUND;
    if (val === undefined) return NOT_FOUND;
    return val;
}