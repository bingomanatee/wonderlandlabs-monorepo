import { UpdateDir, TransStatus } from './constants';
import { Observable, Observer, Subscription } from 'rxjs';
export type Obj = Record<string, unknown>;
export type ForestId = string;
type UpdateDirKeys = keyof typeof UpdateDir;
export type UpdateDirType = typeof UpdateDir[UpdateDirKeys];
export interface ForestIF {
    createBranch(config: Partial<BranchConfig>, name?: string): BranchIF;
    items: Map<ForestId, ForestItemTransactionalIF>;
    register(item: ForestItemTransactionalIF): void;
    trans(name: string, fn: TransFn): void;
    removeTrans(trans: TransIF): void;
    test?: ForestItemTestFn;
    filter?: ForestItemFilterFn;
}
export interface TypedForestIF<ValueType> extends ForestIF {
    value: ValueType;
}
export interface TypedBranchIF<ValueType> extends BranchIF {
    value: ValueType;
}
export type DoMethod = (...args: any[]) => void;
export interface LeafIF extends ForestItemIF {
    branch: BranchIF;
}
type validateFn = (value: unknown, leaf: LeafIF) => void;
export type LeafConfig = Obj & {
    type?: string;
    validate?: validateFn;
};
export type JsonObj = Obj;
export interface ForestItemIF {
    name: string;
    forest: ForestIF;
    value: unknown;
    observable: Observable<unknown>;
    report(): JsonObj;
    subscribe(observerOrNext?: SubscribeListener): Subscription;
    validate(dir?: UpdateDirType): void;
    do: Record<string, DoMethod>;
}
export type SubscribeListener = Partial<Observer<unknown>> | ((value: unknown) => void);
export interface ForestItemTransactionalIF extends ForestItemIF {
    forestId: ForestId;
    pushTempValue(value: unknown, transId: TransID, direction?: UpdateDirType): void;
    flushTemp(): void;
    commit(): void;
}
export type ForestItemTestFn = (value: unknown, target: ForestItemIF) => void;
export type ForestItemFilterFn = (value: unknown, target: ForestItemIF) => unknown;
export interface TransactionalForestItemIF {
    commit(): void;
    readonly committedValue: unknown;
    readonly hasTempValues: boolean;
}
export type childKey = string | number;
export interface BranchIF extends ForestItemTransactionalIF {
    leaves?: Map<childKey, LeafIF>;
    get(key: childKey): unknown;
    set(key: childKey, value: unknown): void;
    addChild(config: Partial<BranchConfig>, name: childKey): BranchIF;
    addChildren(children: ChildConfigs): void;
    hasChild(name: childKey): void;
}
export type BranchDoMethod = (state: BranchIF, ...args: unknown[]) => unknown;
export type BranchConfigDoMethod = (state: BranchIF, ...args: unknown[]) => unknown;
export type LeafConfigDoMethod = (state: LeafIF, ...args: unknown[]) => unknown;
export type BranchConfig = Obj & {
    name: string;
    $value: unknown;
    leaves?: Record<string, LeafConfig>;
    test?: ForestItemTestFn;
    filter?: ForestItemFilterFn;
    actions?: Record<string, BranchConfigDoMethod>;
};
export type ChildConfigs = Record<string, BranchConfig>;
type TransStatusKeys = keyof typeof TransStatus;
export type TransStatusItem = typeof TransStatus[TransStatusKeys];
export type TransID = string;
export interface TransIF {
    id: TransID;
    status: TransStatusItem;
    name: string;
}
export type TransFn = (trans: TransIF) => void;
export type TransValue = {
    id: TransID;
    value: unknown;
};
export type ChildData = {
    key: string;
    child: ForestItemIF;
};
export {};
