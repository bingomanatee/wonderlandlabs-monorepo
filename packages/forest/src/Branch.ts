import { BranchConfig, BranchIF, ForestIF, LeafConfig, LeafIF } from './types';
import { c } from '@wonderlandlabs/collect';

import Leaf from './Leaf';
import { collectObj } from '@wonderlandlabs/collect/lib/types';
import Forest from './Forest';

export default class Branch implements BranchIF {
  constructor(private config: BranchConfig, public forest: ForestIF) {
    this.coll = c(config.$value);
    this.name = config.name;

    if (config.leaves) {
      c(config.leaves).forEach((config: LeafConfig, name) => {
        this.addLeaf(config, name);
      });
    }
  }

  public leaves?: Map<string, LeafIF>;

  public addLeaf(config: LeafConfig, name: string) {
    if (!this.leaves) {
      this.leaves = new Map();
    }
    const leaf = new Leaf(this, config, name);
    this.leaves.set(name, leaf);
  }

  public name = '';

  public coll: collectObj;

  public get value() {
    return this.coll.value;
  }

  get(name: string) {
    return this.coll.get(name);
  }

  static create(config: BranchConfig, name?: string) {
    const forest = new Forest();
    return forest.createBranch(config, name);
  }
}
