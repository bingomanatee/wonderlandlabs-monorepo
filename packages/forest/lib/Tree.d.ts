import { ActionName, BranchIF, DataEngineIF, ForestIF, TreeIF, TreeName, TreeSeed, Acts, DiscardedBranchIF } from "./types";
export declare class Tree implements TreeIF {
    forest: ForestIF;
    name: TreeName;
    constructor(forest: ForestIF, name: TreeName, seed: TreeSeed);
    readonly trimmed: DiscardedBranchIF[];
    private validator?;
    root: BranchIF;
    get top(): BranchIF;
    dataEngine: string;
    private _engine?;
    get engine(): DataEngineIF;
    get value(): unknown;
    validate(): void;
    do(name: ActionName, ...args: unknown[]): unknown;
    readonly acts: Acts;
    private initActs;
    trim(id: number, errorId: number): BranchIF | undefined;
}
