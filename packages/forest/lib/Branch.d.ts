import { BranchConfig, BranchIF, ForestIF, LeafConfig, LeafIF } from './types';
import { collectObj } from '@wonderlandlabs/collect/lib/types';
export default class Branch implements BranchIF {
    private config;
    forest: ForestIF;
    constructor(config: BranchConfig, forest: ForestIF);
    leaves?: Map<string, LeafIF>;
    addLeaf(config: LeafConfig, name: string): void;
    name: string;
    coll: collectObj;
    get value(): any;
    get(name: string): any;
}
