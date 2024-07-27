export type DataEngineName = string;
export type TreeName = string;
export type ActionName = string;
export type GenObj = Record<string, unknown>;
export declare function isObj(a: unknown): a is object;
export type ActionMap = Map<ActionName, ActionIF>;
export declare function isDataEngineValidatorFn(data: unknown): data is DataEngineValidatorFn;
export type DataEngineValidatorFn = (data: unknown, tree: TreeIF) => boolean;
export declare function isDataEngineIF(a: unknown): a is DataEngineIF;
export interface DataEngineIF {
    name: DataEngineName;
    actions: ActionMap;
    validator?: DataEngineValidatorFn;
}
export type KeyVal = {
    key: unknown;
    val: unknown;
};
export type TreeValidator = (tree: TreeIF) => void;
export type TreeSeed = {
    val?: unknown;
    dataEngine: DataEngineName;
    validator?: TreeValidator;
};
export type Cacheable = boolean | symbol;
export interface ActionIF {
    name: ActionName;
    cacheable?: Cacheable;
    delta(branch: BranchIF, ...args: ActionDeltaArgs): unknown;
}
export type ActionDeltaArgs = unknown[];
export interface BranchIF {
    readonly value: unknown;
    id: number;
    prev?: BranchIF;
    next?: BranchIF;
    tree: TreeIF;
    action: ActionIF;
    push(branch: BranchIF): void;
    popMe(): BranchIF;
    cutMe(errorId: number): BranchIF;
    destroy(): void;
    isTop: boolean;
    isRoot: boolean;
    data?: ActionDeltaArgs;
    isAlive: boolean;
    clearPrevCache(clear?: boolean): void;
    isCached: boolean;
}
export interface DiscardedBranchIF {
    id: number;
    action: string;
    data?: ActionDeltaArgs;
    errorId: number;
}
export interface DoErrorIF {
    id: number;
    message: string;
}
export type ActFn = (...args: ActionDeltaArgs) => unknown;
export type Acts = Record<string, ActFn>;
export interface TreeIF {
    name: TreeName;
    root: BranchIF;
    top: BranchIF;
    acts: Acts;
    readonly dataEngine: DataEngineName;
    readonly forest: ForestIF;
    readonly value: unknown;
    do(name: ActionName, ...args: ActionDeltaArgs): unknown;
    validate(): void;
    trim(id: number, errorId: number): BranchIF | undefined;
    trimmed: DiscardedBranchIF[];
}
export type EngineFactory = (tree: TreeIF) => DataEngineIF;
export type DataEngineFactory = {
    name: string;
    factory: EngineFactory;
};
export declare function isDataEngineFactory(a: unknown): a is DataEngineFactory;
export type TransactFn = (transId: number) => unknown;
export interface ForestIF {
    tree(name: TreeName, seed?: TreeSeed): TreeIF;
    nextID: number;
    dataEngine(nameOrEngine: DataEngineName | DataEngineIF | DataEngineFactory, tree?: TreeIF): DataEngineIF;
    transact(fn: TransactFn): unknown;
    errors: DoErrorIF[];
}
export type ATIDs = Set<number>;
export type ActionFactory = (engine: DataEngineIF) => ActionIF;
