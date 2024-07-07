import { DELETED, NOT_FOUND } from "./constants";
import type { BranchIF } from "./types";

export function mp(...args: unknown[]): Map<unknown, unknown> {
  const e: [unknown, unknown][] = [];
  while (args.length > 1) {
    //@ts-ignore
    e.push(args.splice(0, 2));
  }
  return new Map(e);
}

export function nf(val: unknown) {
  if (val === DELETED) {
    return NOT_FOUND;
  }
  if (val === undefined) {
    return NOT_FOUND;
  }
  return val;
}

export function delToUndef(val: unknown) {
  if (val === DELETED) {
    return undefined;
  }
  return val;
}

export function withoutDeletes(m: Map<unknown, unknown>) {
  const out = new Map(m);
  m.forEach((v, k) => {
    if (v === DELETED || v === NOT_FOUND) {
      out.delete(k);
    }
  });
  return out;
}
export function linkBranches(a?: BranchIF, b?: BranchIF) {
  if (a) {
    a.next = b;
  }
  if (b) {
    b.prev = a;
  }
}
