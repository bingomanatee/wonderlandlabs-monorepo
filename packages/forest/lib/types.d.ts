import { UpdateDir, TransStatus } from './constants';
import { Observable, Observer, Subscription } from 'rxjs';
export type Obj = Record<string, unknown>;
export type ForestId = string;
type UpdateDirKeys = keyof typeof UpdateDir;
export type UpdateDirType = typeof UpdateDir[UpdateDirKeys];
type validateFn = (value: unknown, leaf: LeafIF) => void;
export type DoMethod = (...args: any[]) => void;
type ForestItemConfig = {
    type?: string;
    validate?: validateFn;
    test?: ForestItemTestFn;
};
export interface ForestIF {
    createBranch(config: Partial<BranchConfig>, name?: string): BranchIF;
    items: Map<ForestId, ForestItemTransactionalIF>;
    register(item: ForestItemTransactionalIF): void;
    trans(name: string, fn: TransFn): void;
    removeTrans(trans: TransIF): void;
    test?: ForestItemTestFn;
    filter?: ForestItemFilterFn;
    pending: TransIF[];
}
export interface TypedForestIF<ValueType> extends ForestIF {
    value: ValueType;
}
export interface TypedBranchIF<ValueType> extends BranchIF {
    value: ValueType;
}
export interface LeafIF extends ForestItemIF {
    branch: BranchIF;
}
export type LeafConfigDoMethod = (state: LeafIF, ...args: unknown[]) => unknown | void;
export type LeafConfig = ForestItemConfig & {
    $value?: unknown;
    actions?: Record<string, LeafConfigDoMethod>;
    strict?: boolean;
    required?: boolean;
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
    removeTempValues(id: TransID): void;
}
export type ForestItemTestFn = (value: unknown, target: ForestItemIF) => void;
export type ForestItemFilterFn = (value: unknown, target: ForestItemIF) => unknown;
export type childKey = string | number;
export interface BranchIF extends ForestItemTransactionalIF {
    addChild(config: Partial<BranchConfig>, name: childKey): BranchIF;
    addChildren(children: ChildConfigs): void;
    child(name: childKey): ForestItemIF | undefined;
    get(key: childKey): unknown;
    hasChild(name: childKey): void;
    leaves: Map<childKey, LeafIF>;
    set(key: childKey, value: unknown): void;
}
export type BranchConfigDoMethod = (state: BranchIF, ...args: unknown[]) => unknown;
export type BranchConfig = ForestItemConfig & {
    $value: unknown;
    actions?: Record<string, BranchConfigDoMethod>;
    children?: Record<string, BranchConfig>;
    filter?: ForestItemFilterFn;
    leaves?: Record<string, LeafConfig>;
    name: string;
};
export type ChildConfigs = Record<string, BranchConfig>;
type TransStatusKeys = keyof typeof TransStatus;
export type TransStatusItem = typeof TransStatus[TransStatusKeys];
export type TransID = string;
export interface TransIF {
    id: TransID;
    name: string;
    status: TransStatusItem;
}
export type TransFn = (trans: TransIF) => void;
export type TransValue = {
    id: TransID;
    value: unknown;
};
export type ChildData = {
    child: ForestItemIF;
    key: string;
};
export {};
