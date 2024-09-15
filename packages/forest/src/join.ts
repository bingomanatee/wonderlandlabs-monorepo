import { BranchIF } from "./types";

export function join(b1: BranchIF | undefined, b2: BranchIF | undefined) {
  if (b1 === b2) return;
  if (b1) b1.next = b2;
  if (b2) b2.prev = b1;
}
