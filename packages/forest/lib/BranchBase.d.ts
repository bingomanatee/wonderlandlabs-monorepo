import type { LeafIF, TreeIF, ChangeBase, BranchIF, ChangeResponse, IterFn, TreeData } from "./types";
import type { BranchParams } from "./helpers/paramTypes";
import type { Status, Action } from "./helpers/enums";
/**
 * this is a pure base branch; all concrete implementations
 * have specific methods related to I/O of theier data types.
 * So any methods about reading/making data values are delegated to
 * implementing classes.
 */
export declare abstract class BranchBase implements BranchIF {
    tree: TreeIF;
    constructor(tree: TreeIF, params: BranchParams);
    values(list?: TreeData<unknown, unknown> | undefined): TreeData<unknown, unknown>;
    mergedData(): TreeData<unknown, unknown>;
    cache?: TreeData<unknown, unknown> | undefined;
    has(key: unknown, local?: boolean): boolean;
    leaf(key: unknown): LeafIF;
    get(key: unknown): unknown;
    make(parmas: BranchParams): BranchIF;
    set(key: unknown, val: unknown): unknown;
    protected _initData(params: BranchParams): void;
    del(key: unknown): void;
    data: TreeData;
    protected get dataType(): symbol;
    forEach(fn: IterFn): void;
    clearCache(ignoreScopes: boolean): void;
    readonly causeID?: string;
    /**
     * remove all references in this node.
     * assumes that extrenal references TO this node are adjusted elsewhere.
     */
    destroy(): void;
    /**
     * remove this branch from the list chain; link the next and prev branches to each other
     */
    pop(): void;
    push(branch: BranchIF): void;
    prune(): void;
    readonly id: number;
    readonly cause: Action;
    readonly status: Status;
    next?: BranchIF | undefined;
    prev?: BranchIF | undefined;
    get forest(): import("./types").ForestIF;
    ensureCurrentScope(): void;
    async: boolean;
    change(c: ChangeBase<unknown, unknown>): ChangeResponse<unknown, unknown>;
}
