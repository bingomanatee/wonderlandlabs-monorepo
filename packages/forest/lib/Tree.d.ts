import { ActionName, BranchIF, DataEngineIF, ForestIF, TreeIF, TreeName, TreeSeed } from "./types";
export declare class Tree implements TreeIF {
    forest: ForestIF;
    name: TreeName;
    constructor(forest: ForestIF, name: TreeName, seed: TreeSeed);
    private validator?;
    root: BranchIF;
    get top(): BranchIF;
    dataEngine: string;
    private _engine?;
    get engine(): DataEngineIF;
    get value(): unknown;
    validate(): void;
    do(name: ActionName, ...args: unknown[]): unknown;
    trim(id: number): BranchIF | undefined;
}
