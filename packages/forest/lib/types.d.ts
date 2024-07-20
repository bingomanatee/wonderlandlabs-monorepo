export type DataEngineName = string;
export type TreeName = string;
export type ActionName = string;
export type GenObj = Record<string, unknown>;
export declare function isObj(a: unknown): a is object;
export type ActionMap = Map<ActionName, ActionIF>;
export type DataEngineValidatorFn = (data: unknown) => boolean;
export interface DataEngineIF {
    name: DataEngineName;
    validator?: DataEngineValidatorFn;
    actions: ActionMap;
}
export type KeyVal = {
    key: unknown;
    val: unknown;
};
export type TreeSeed = {
    val?: unknown;
    dataEngine: DataEngineName;
};
export interface ActionIF {
    name: ActionName;
    cacheable?: boolean;
    delta(branch: BranchIF, ...args: ActionDeltaArgs): unknown;
}
export type ActionDeltaArgs = unknown[];
export interface BranchIF {
    readonly value: unknown;
    prev?: BranchIF;
    next?: BranchIF;
    tree: TreeIF;
    action: ActionIF;
    push(branch: BranchIF): void;
    popMe(): BranchIF;
    cutMe(): BranchIF;
    destroy(): void;
    isTop: boolean;
    isRoot: boolean;
    data?: ActionDeltaArgs;
    isAlive: boolean;
}
export interface TreeIF {
    name: TreeName;
    root: BranchIF;
    top: BranchIF;
    readonly dataEngine: DataEngineName;
    readonly forest: ForestIF;
    readonly value: unknown;
    do(name: ActionName, value?: unknown, options?: GenObj): BranchIF;
}
export type EngineFactory = (tree: TreeIF) => DataEngineIF;
export type DataEngineFactory = {
    name: string;
    factory: EngineFactory;
};
export declare function isDataEngineFactory(a: unknown): a is DataEngineFactory;
export interface ForestIF {
    tree(name: TreeName, seed?: TreeSeed): TreeIF;
    dataEngine(nameOrEngine: DataEngineName | DataEngineIF | DataEngineFactory, tree?: TreeIF): DataEngineIF;
}
