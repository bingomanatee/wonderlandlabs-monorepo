import type { BranchIF } from "./types";
export declare function mp(...args: unknown[]): Map<unknown, unknown>;
export declare function nf(val: unknown): {} | null;
export declare function delToUndef(val: unknown): unknown;
export declare function withoutDeletes(m: Map<unknown, unknown>): Map<unknown, unknown>;
export declare function linkBranches(a?: BranchIF, b?: BranchIF): void;
/**
 * finds a branch meeting qualifications starting from and including the first param.
 */
export declare function findPrevBranch(start: BranchIF, test: (b: BranchIF) => boolean): BranchIF | undefined;
