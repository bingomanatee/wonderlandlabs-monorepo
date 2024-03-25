import { BranchConfig, BranchIF, ForestIF, isBranchConfig, Obj } from './types';
import Branch from './Branch';

export default class Forest implements ForestIF {
  constructor(config?: Obj) {}

  branches: Map<string, BranchIF> = new Map();

  createBranch(config: Partial<BranchConfig>, name?: string): BranchIF {
    if (name) {
      return this.createBranch({ ...config, name });
    }
    if (!isBranchConfig(config)) {
      throw new Error('cannot create a branch without a name');
    }
    if (this.branches.has(config.name)) {
      throw new Error('cannot redefine branch ' + config.name);
    }
    const branch: BranchIF = new Branch(config, this);
    this.branches.set(config.name, branch);
    return branch;
  }
}
