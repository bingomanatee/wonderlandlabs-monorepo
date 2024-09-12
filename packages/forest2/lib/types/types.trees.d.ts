import type { BranchIF } from "./types.branch";
import type { OffshootIF } from "../types";
import type { ForestIF } from "./types.forest";
import type { ChangeIF, Notable, SubscribeFn, ValueProviderFN } from "./types.shared";
import { PartialObserver, Subscription, Observable } from "rxjs";
export type TreeName = string;
export type TreeValuation<ValueType> = {
    value: ValueType;
    tree: TreeIF<ValueType>;
    isValid: boolean;
    error?: string;
};
export interface TreeIF<ValueType> extends Notable {
    name?: TreeName;
    root?: BranchIF<ValueType>;
    top?: BranchIF<ValueType>;
    readonly params?: TreeParams<ValueType>;
    forest: ForestIF;
    readonly isUncacheable?: boolean;
    offshoots?: OffshootIF<ValueType>[];
    rollback(time: number, message: string): void;
    /**
     * note - the only advantage "grow" has over next is to assert a change function and parmeters for that function.
     */
    grow(change: ChangeIF<ValueType>): BranchIF<ValueType>;
    next(value: ValueType, name?: string): void;
    value: ValueType;
    subject: Observable<ValueType>;
    subscribe(observer: PartialObserver<ValueType> | SubscribeFn<ValueType>): Subscription;
    valueAt(at: number): ValueType | undefined;
    validate(value: ValueType): TreeValuation<ValueType>;
    branchCount(upTo?: number): number;
}
export type ValidatorFn<TreeValueType> = (value: TreeValueType, tree: TreeIF<TreeValueType>) => Error | void | undefined;
export type TreeClonerFn<TreeValueType> = (branch?: BranchIF<TreeValueType>) => TreeValueType;
export type TreeParams<TreeValueType> = {
    initial?: TreeValueType;
    uncacheable?: boolean;
    maxBranches?: number;
    trimTo?: number;
    validator?: ValidatorFn<TreeValueType>;
    serializer?: ValueProviderFN<TreeValueType>;
    cloneInterval?: number;
};
