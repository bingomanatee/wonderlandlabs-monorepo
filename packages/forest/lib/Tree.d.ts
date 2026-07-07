import { MutatorName, BranchIF, EngineIF, ForestIF, TreeIF, TreeName, TreeSeed, Mutators, DiscardedBranchIF } from "./types";
export declare class Tree<ValueType = unknown> implements TreeIF<ValueType> {
    forest: ForestIF;
    name: TreeName;
    constructor(forest: ForestIF, name: TreeName, seed: TreeSeed<ValueType>);
    readonly trimmed: DiscardedBranchIF[];
    private validators?;
    private mutValidators;
    engineInput?: unknown;
    root: BranchIF<ValueType>;
    get top(): BranchIF<ValueType>;
    engineName: string;
    private _engine?;
    get engine(): EngineIF<ValueType>;
    get value(): ValueType;
    validate(): void;
    mutate(name: MutatorName, ...input: unknown[]): unknown;
    readonly mut: Mutators;
    private makeMut;
    trim(id: number, errorId: number): BranchIF<ValueType> | undefined;
}
