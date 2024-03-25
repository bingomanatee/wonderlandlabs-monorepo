import { BranchConfig, BranchIF, ForestIF, Obj } from './types';

export default class Branch implements BranchIF {
  constructor(private config: BranchConfig, public forest: ForestIF) {
    this.value = config.$value;
    this.name = config.name;
  }

  public name = '';

  public value: unknown = null;
}
