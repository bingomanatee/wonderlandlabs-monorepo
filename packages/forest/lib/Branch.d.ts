import { UpdateDirType, BranchConfig, BranchIF, ForestIF, ForestItemIF, LeafConfig, LeafIF, TransID, ChildConfigs, childKey, DoMethod } from './types';
import ForestItem from './ForestItem';
export default class Branch extends ForestItem implements BranchIF {
    private config;
    forest: ForestIF;
    constructor(config: BranchConfig, forest: ForestIF);
    leaves: Map<string, LeafIF>;
    protected _initLeaves(): void;
    addLeaf(config: LeafConfig, name: string): void;
    get(name: string): any;
    set(name: string, value: unknown): void;
    static create(config: BranchConfig, name?: string): BranchIF;
    pushTempValue(value: unknown, id: TransID, direction?: UpdateDirType): void;
    parent?: BranchIF;
    validate(dir?: UpdateDirType): void;
    protected _initChildren(): void;
    child(name: childKey): ForestItemIF | undefined;
    addChild(config: Partial<BranchConfig>, name: childKey): Branch;
    addChildren(children: ChildConfigs): void;
    hasChild(name: childKey): boolean;
    children: Map<childKey, BranchIF>;
    do: Record<string, DoMethod>;
    _initDo(): void;
}
