import { UpdateDirType, BranchConfig, BranchIF, ForestIF, ForestItemIF, LeafConfig, LeafIF, TransID, ChildConfigs, childKey } from './types';
import ForestItem from './ForestItem';
export default class Branch extends ForestItem implements BranchIF, ForestItemIF {
    private config;
    forest: ForestIF;
    constructor(config: BranchConfig, forest: ForestIF);
    leaves?: Map<string, LeafIF>;
    addLeaf(config: LeafConfig, name: string): void;
    get(name: string): any;
    set(name: string, value: unknown): void;
    static create(config: BranchConfig, name?: string): BranchIF;
    pushTempValue(value: unknown, id: TransID, direction?: UpdateDirType): void;
    parent?: ForestItemIF;
    validate(dir?: UpdateDirType): void;
    child(name: childKey): ForestItemIF | undefined;
    addChild(config: Partial<BranchConfig>, name: childKey): Branch;
    addChildren(children: ChildConfigs): void;
    hasChild(name: childKey): boolean;
    children: Map<childKey, BranchIF>;
}
