import { BranchIF, LeafConfig, LeafIF } from './types';

export default class Leaf implements LeafIF {
  constructor(
    public branch: BranchIF,
    public config: LeafConfig,
    public name: string
  ) {}

  get value() {
    return this.branch.get(this.name);
  }
}
