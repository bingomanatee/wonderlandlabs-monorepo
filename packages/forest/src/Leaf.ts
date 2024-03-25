import { BranchIF, LeafConfig, LeafIF } from './types';

export default class Leaf implements LeafIF {
  constructor(public branch: BranchIF, public config: LeafConfig) {}

  value = null;
}
