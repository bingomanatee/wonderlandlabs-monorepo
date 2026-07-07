export type EngineName = string;
export type TreeName = string;
export type MutatorName = string;
export type GenObj = Record<string, unknown>;
export type MapSrc<k = unknown, v = unknown> = [k, v][];
export declare function isObj(a: unknown): a is object;
export type MutatorMap<ValueType = unknown> = Map<MutatorName, MutatorIF<ValueType>>;
export declare function isDataEngineValidatorFn(data: unknown): data is EngineValidatorFn;
export type EngineValidatorFn = (data: unknown, tree: TreeIF) => boolean | void;
export declare function isEngineIF(a: unknown): a is EngineIF;
export interface EngineIF<ValueType = unknown> {
    name: EngineName;
    actions: MutatorMap<ValueType>;
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
export type TreeSeed<ValueType = unknown> = {
    val?: ValueType;
    engineName: EngineName;
    engineInput?: unknown;
    validators?: TreeValidator[];
    mutatorValidators?: MutationValidatorIF[];
};
export type Cacheable = boolean | symbol;
export interface MutatorIF<ValueType = unknown> {
    name: MutatorName;
    cacheable?: Cacheable;
    mutator(branch: BranchIF<ValueType>, args?: MutatorArgs): ValueType;
}
export type MutatorArgs = unknown[];
export interface BranchIF<ValueType = unknown> {
    readonly value: ValueType;
    id: number;
    prev?: BranchIF<ValueType>;
    next?: BranchIF<ValueType>;
    tree: TreeIF<ValueType>;
    mutator: MutatorIF<ValueType>;
    push(branch: BranchIF<ValueType>): void;
    popMe(): BranchIF<ValueType>;
    cutMe(errorId: number): BranchIF<ValueType>;
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
export type TreeIF<ValueType = unknown> = {
    name: TreeName;
    root: BranchIF<ValueType>;
    top: BranchIF<ValueType>;
    mut: Mutators;
    readonly engineName: EngineName;
    readonly forest: ForestIF;
    readonly value: unknown;
    readonly engineInput?: unknown;
    mutate(name: MutatorName, ...args: MutatorArgs): void;
    validate(): void;
    trim(id: number, errorId: number): BranchIF<ValueType> | undefined;
    trimmed: DiscardedBranchIF[];
};
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
    tree<ValueType>(name: TreeName, seed?: TreeSeed<ValueType>): TreeIF<ValueType>;
    nextID: number;
    engine<ValueType>(nameOrEngine: EngineName | EngineIF<ValueType> | EngineFactory, tree?: TreeIF<ValueType>): EngineIF<ValueType>;
    transact(fn: TransactFn): unknown;
    errors: TransactionErrorIF[];
}
export type ATIDs = Set<number>;
export type MutationFactcory = (engine: EngineIF) => MutatorIF;
