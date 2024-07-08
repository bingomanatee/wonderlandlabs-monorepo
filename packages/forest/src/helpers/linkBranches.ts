import type { BranchIF } from "./../types";

export function linkBranches(a?: BranchIF, b?: BranchIF) {
  if (a) {
    a.next = b;
  }
  if (b) {
    b.prev = a;
  }
}
