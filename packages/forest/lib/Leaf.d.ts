import { BranchIF, LeafConfig, LeafIF } from './types';
export default class Leaf implements LeafIF {
    branch: BranchIF;
    constructor(branch: BranchIF, config: LeafConfig | string, name: string);
    name: string;
    config: LeafConfig;
    get value(): unknown;
    validate(): void;
}
