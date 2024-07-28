export type EngineName = string;
export type TreeName = string;
export type MutatorName = string;
export type GenObj = Record<string, unknown>;
export type MapSrc<k = unknown, v = unknown> = [k, v][];
export declare function isObj(a: unknown): a is object;
export type MutatorMap = Map<MutatorName, MutatorIF>;
export declare function isDataEngineValidatorFn(data: unknown): data is EngineValidatorFn;
export type EngineValidatorFn = (data: unknown, tree: TreeIF) => boolean;
export declare function isEngineIF(a: unknown): a is EngineIF;
export interface EngineIF {
    name: EngineName;
    actions: MutatorMap;
    validator?: EngineValidatorFn;
}
export type MutationValidatorFn = (input: unknown[], tree: TreeIF, name: string) => void;
export interface MutationValidatorIF {
    name: string;
    onlyFor?: string | string[];
    validator: MutationValidatorFn;
}
export type KeyVal = {
    key: unknown;
    val: unknown;
};
export type TreeValidator = (tree: TreeIF) => false | void;
export type TreeSeed = {
    val?: unknown;
    engineName: EngineName;
    engineInput?: unknown;
    validators?: TreeValidator[];
    mutatorValidators?: MutationValidatorIF[];
};
export type Cacheable = boolean | symbol;
export interface MutatorIF {
    name: MutatorName;
    cacheable?: Cacheable;
    mutator(branch: BranchIF, ...args: MutatorArgs): unknown;
}
export type MutatorArgs = unknown[];
export interface BranchIF {
    readonly value: unknown;
    id: number;
    prev?: BranchIF;
    next?: BranchIF;
    tree: TreeIF;
    mutator: MutatorIF;
    push(branch: BranchIF): void;
    popMe(): BranchIF;
    cutMe(errorId: number): BranchIF;
    destroy(): void;
    isTop: boolean;
    isRoot: boolean;
    input?: MutatorArgs;
    isAlive: boolean;
    clearPrevCache(clear?: boolean): void;
    isCached: boolean;
}
export interface DiscardedBranchIF {
    id: number;
    mutator: string;
    data?: MutatorArgs;
    errorId: number;
}
export interface TransactionErrorIF {
    id: number;
    message: string;
    mutation?: string;
    validator?: string;
}
export type MutatorFn = (...args: MutatorArgs) => unknown;
export type Mutators = Record<string, MutatorFn>;
export interface TreeIF {
    name: TreeName;
    root: BranchIF;
    top: BranchIF;
    mut: Mutators;
    readonly engineName: EngineName;
    readonly forest: ForestIF;
    readonly value: unknown;
    readonly engineInput?: unknown;
    mutate(name: MutatorName, ...args: MutatorArgs): unknown;
    validate(): void;
    trim(id: number, errorId: number): BranchIF | undefined;
    trimmed: DiscardedBranchIF[];
}
export declare function isTreeIF(a: unknown): a is TreeIF;
export type GenFun = () => unknown;
export type EngineFactoryFn = (tree: TreeIF) => EngineIF;
export type EngineFactory = {
    name: string;
    factory: EngineFactoryFn;
};
export declare function isEngineFactory(a: unknown): a is EngineFactory;
export type TransactFn = (transId: number) => unknown;
export interface ForestIF {
    tree(name: TreeName, seed?: TreeSeed): TreeIF;
    nextID: number;
    engine(nameOrEngine: EngineName | EngineIF | EngineFactory, tree?: TreeIF): EngineIF;
    transact(fn: TransactFn): unknown;
    errors: TransactionErrorIF[];
}
export type ATIDs = Set<number>;
export type MutationFactcory = (engine: EngineIF) => MutatorIF;
