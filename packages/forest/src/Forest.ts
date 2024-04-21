import {
  BranchConfig,
  BranchIF,
  ForestIF,
  ForestItemIF,
  TransFn,
  TransIF,
} from './types';
import Branch from './Branch';
import { Trans } from './Trans';
import { isBranchConfig } from './helpers';

export default class Forest implements ForestIF {
  items: Map<string, ForestItemIF> = new Map();

  register(item: ForestItemIF): void {
    this.items.set(item.forestId, item);
  }

  createBranch(config: Partial<BranchConfig>, name?: string): BranchIF {
    if (name) {
      return this.createBranch({ ...config, name });
    }
    if (!isBranchConfig(config)) {
      throw new Error('bad configuration');
    }

    const branch: BranchIF = new Branch(config, this);
    this.register(branch); // redundant with branch constructor but why not
    return branch;
  }

  pending: TransIF[] = [];

  trans(name: string, fn: TransFn) {
    const trans = new Trans({ name, forest: this });
    this.pending.push(trans);
    try {
      fn(trans);
      this.removeTrans(trans);
      if (this.pending.length <= 0) {
        this.commit();
      }
    } catch (err) {
      trans.fail(err as Error); // will removeTrans
      throw err;
    }
  }

  removeTrans(trans: TransIF) {
    const index = this.pending.findIndex((t) => t.id === trans.id);
    if (index >= 0) {
      const rejects = this.pending.slice(index);
      this.pending = this.pending.slice(0, index);
      rejects.forEach((t) => {});
    }
  }

  commit() {
    this.items.forEach((item) => {
      item.commit();
    });
    this.items.forEach((item) => item.flushTemp());
  }
}
