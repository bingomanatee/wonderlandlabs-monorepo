import type { BranchIF } from "./types.branch";
import type { OffshootIF } from "./types";
import type { ForestIF } from "./types.forest";
import type { TreeIF, TreeName, TreeParams } from "./types.trees";
import type { ChangeIF, Info, InfoParams, SubscribeFn } from "./types.shared";
import type { PartialObserver } from "rxjs";
export default class Tree<ValueType> implements TreeIF<ValueType> {
    forest: ForestIF;
    readonly name: TreeName;
    private params?;
    constructor(forest: ForestIF, name: TreeName, params?: TreeParams<ValueType>);
    private stream;
    next(next: ValueType): void;
    rollback(time: number, message: string): void;
    offshoots?: OffshootIF<ValueType>[];
    root?: BranchIF<ValueType>;
    top?: BranchIF<ValueType>;
    grow(change: ChangeIF<ValueType>): BranchIF<ValueType>;
    get subject(): import("rxjs").Observable<ValueType>;
    subscribe(observer: PartialObserver<ValueType> | SubscribeFn<ValueType>): import("rxjs").Subscription;
    valueAt(at: number): ValueType | undefined;
    get value(): ValueType;
    private _notes?;
    addNote(message: string, params?: InfoParams): void;
    hasNoteAt(time: number): boolean;
    notes(fromTime: number, toTime?: number): Info[];
}
