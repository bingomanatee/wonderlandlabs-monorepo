import { BranchIF, LeafConfig, LeafIF } from './types';
export default class Leaf implements LeafIF {
    branch: BranchIF;
    config: LeafConfig;
    name: string;
    constructor(branch: BranchIF, config: LeafConfig, name: string);
    get value(): unknown;
}
