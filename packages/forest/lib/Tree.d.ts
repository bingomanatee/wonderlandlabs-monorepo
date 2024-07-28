import { MutatorName, BranchIF, EngineIF, ForestIF, TreeIF, TreeName, TreeSeed, Mutators, DiscardedBranchIF } from "./types";
export declare class Tree implements TreeIF {
    forest: ForestIF;
    name: TreeName;
    constructor(forest: ForestIF, name: TreeName, seed: TreeSeed);
    readonly trimmed: DiscardedBranchIF[];
    private validators?;
    private mutValidators;
    root: BranchIF;
    get top(): BranchIF;
    engineName: string;
    private _engine?;
    get engine(): EngineIF;
    get value(): unknown;
    validate(): void;
    mutate(name: MutatorName, ...input: unknown[]): unknown;
    readonly mut: Mutators;
    private makeMut;
    trim(id: number, errorId: number): BranchIF | undefined;
}
