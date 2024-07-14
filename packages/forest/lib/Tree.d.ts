import { ActionName, BranchIF, DataEngineIF, ForestIF, GenObj, TreeIF, TreeName, TreeSeed } from "./types";
export declare class Tree implements TreeIF {
    forest: ForestIF;
    constructor(forest: ForestIF, name: TreeName, seed: TreeSeed);
    root: BranchIF;
    get top(): BranchIF;
    dataEngine: string;
    private _engine?;
    get engine(): DataEngineIF;
    get value(): unknown;
    do(name: ActionName, value?: unknown, options?: GenObj): BranchIF;
}
