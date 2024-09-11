import type { BranchIF } from './types/types.branch';
import type { OffshootIF } from './types';
import type { ForestIF } from './types/types.forest';
import type { TreeIF, TreeName, TreeParams, TreeValuation } from './types/types.trees';
import type { ChangeIF, Info, InfoParams, SubscribeFn } from './types/types.shared';
import type { PartialObserver } from 'rxjs';
export declare const CLONE_NAME = "!CLONE!";
export default class Tree<ValueType> implements TreeIF<ValueType> {
    forest: ForestIF;
    readonly name: TreeName;
    private params?;
    constructor(forest: ForestIF, name: TreeName, params?: TreeParams<ValueType>);
    get isUncacheable(): boolean;
    private stream;
    next(next: ValueType, name?: string): void;
    rollback(time: number, message: string): void;
    offshoots?: OffshootIF<ValueType>[];
    root?: BranchIF<ValueType>;
    top?: BranchIF<ValueType>;
    grow(change: ChangeIF<ValueType>): BranchIF<ValueType>;
    validate(value: ValueType): TreeValuation<ValueType>;
    _maybeCache(): void;
    _maybeTrim(): void;
    /**
     *
     * in interest of economy we seek out two branches:
     *  1 the first branch AFTER the first task in play (because we can't trim above that)
     * 2 the earliest branch up to or past the max count (becuase we always want to trim below that).
     *
     * We trim to the LOWEST of these two branches;
     */
    private _trim;
    private _trimBefore;
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
     * @param {number} upTo
     * @returns
     */
    depth(upTo: number): number;
}
