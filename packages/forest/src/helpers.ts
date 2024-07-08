import { DELETED, NOT_FOUND } from "./constants";
import { isBranchIF } from "./helpers/isBranchIF";
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

/**
 * finds a branch meeting qualifications starting from and including the first param.
 */
export function findPrevBranch(
  start: BranchIF,
  test: (b: BranchIF) => boolean
) {
  let out: BranchIF | undefined = start;
  while (out) {
    if (test(out)) return out;
    out = out.prev;
  }
  return undefined;
}
