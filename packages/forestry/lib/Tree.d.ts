import type { BranchIF } from "./types/types.branch";
import type { OffshootIF } from "./types";
import type { ForestIF } from "./types/types.forest";
import type { TreeIF, TreeName, TreeParams, TreeValuation } from "./types/types.trees";
import type { ChangeIF, Info, InfoParams, MutationValueProviderFN, SubscribeFn } from "./types/types.shared";
import type { PartialObserver } from "rxjs";
export default class Tree<ValueType> implements TreeIF<ValueType> {
    forest: ForestIF;
    readonly name: TreeName;
    readonly params?: TreeParams<ValueType>;
    constructor(forest: ForestIF, name: TreeName, params?: TreeParams<ValueType>);
    get isUncacheable(): boolean;
    private stream;
    next(next: ValueType, name?: string): void;
    rollback(time: number, message: string): void;
    mutate(mutator: MutationValueProviderFN<ValueType>, seed?: any, name?: string): void;
    offshoots?: OffshootIF<ValueType>[];
    root?: BranchIF<ValueType>;
    top?: BranchIF<ValueType>;
    grow(change: ChangeIF<ValueType>): BranchIF<ValueType>;
    validate(value: ValueType): TreeValuation<ValueType>;
    get subject(): import("rxjs").Observable<ValueType>;
    subscribe(observer: PartialObserver<ValueType> | SubscribeFn<ValueType>): import("rxjs").Subscription;
    valueAt(at: number): ValueType | undefined;
    get value(): ValueType;
    private _notes?;
    addNote(message: string, params?: InfoParams): void;
    hasNoteAt(time: number): boolean;
    notes(fromTime: number, toTime?: number): Info[];
    /**
     *
     * returns the size of the tree (number of branches)
     * because _in theory_ a branch tree can be enormous, we provide an upTo
     * value - past which branches are not counted. For instance if upTo = 50
     * then the return value is going to be 0...50.
     *
     * if upTo is falsy, the true length of the branches
     * will be returned however deep that may be
     *
     * @param {number} upTo
     * @returns
     */
    branchCount(upTo?: number): number;
    forEachDown(iterator: (b: BranchIF<ValueType>, count: number) => true | void, maxBranches?: number | null): void;
    forEachUp(iterator: (b: BranchIF<ValueType>, count: number) => true | void, maxBranches?: number | null): void;
}
