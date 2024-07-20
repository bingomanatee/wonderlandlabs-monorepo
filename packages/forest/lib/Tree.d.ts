import { ActionName, BranchIF, DataEngineIF, ForestIF, TreeIF, TreeName, TreeSeed } from "./types";
export declare class Tree implements TreeIF {
    forest: ForestIF;
    name: TreeName;
    constructor(forest: ForestIF, name: TreeName, seed: TreeSeed);
    root: BranchIF;
    get top(): BranchIF;
    dataEngine: string;
    private _engine?;
    get engine(): DataEngineIF;
    get value(): unknown;
    do(name: ActionName, ...args: unknown[]): BranchIF;
}
