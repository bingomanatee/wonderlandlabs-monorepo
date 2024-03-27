import { BranchConfig, BranchIF, ForestIF, Obj } from './types';
export default class Forest implements ForestIF {
    constructor(config?: Obj);
    branches: Map<string, BranchIF>;
    createBranch(config: Partial<BranchConfig>, name?: string): BranchIF;
}
