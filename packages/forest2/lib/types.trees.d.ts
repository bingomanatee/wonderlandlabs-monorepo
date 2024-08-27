import type { BranchIF } from "./types.branch";
import type { OffshootIF } from "./types";
import type { ForestIF } from "./types.forest";
import type { ChangeIF, SubscribeFn } from "./types.shared";
import { PartialObserver, Subscription, Observable } from "rxjs";
export type TreeName = string;
export interface TreeIF<ValueType> {
    name?: TreeName;
    root?: BranchIF<ValueType>;
    top?: BranchIF<ValueType>;
    forest: ForestIF;
    offshoots?: OffshootIF<ValueType>[];
    rollback(time: number, message: string): void;
    grow(change: ChangeIF<ValueType>): BranchIF<ValueType>;
    next(value: ValueType): void;
    value: ValueType;
    subject: Observable<ValueType>;
    subscribe(observer: PartialObserver<ValueType> | SubscribeFn<ValueType>): Subscription;
}
export type ValidatorFn<TreeValueType> = (value: TreeValueType, tree: TreeIF<TreeValueType>) => Error | void | undefined;
export type TreeParams<TreeValueType> = {
    initial?: TreeValueType;
    validator?: ValidatorFn<TreeValueType>;
};
