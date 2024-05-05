import {
  BranchConfig,
  BranchIF,
  ForestId,
  ForestIF,
  ForestItemIF,
  ForestItemTransactionalIF,
  TransFn,
  TransIF,
} from './types';
import Branch from './Branch';
import { Trans } from './Trans';
import { isBranchConfig, isTransactionalIF } from './helpers';

export default class Forest implements ForestIF {
  items: Map<ForestId, ForestItemTransactionalIF> = new Map();

  register(item: ForestItemTransactionalIF): void {
    this.items.set(item.forestId, item);
  }

  createBranch(config: Partial<BranchConfig>, name?: string): BranchIF {
    if (name) {
      return this.createBranch({ ...config, name });
    }
    if (!isBranchConfig(config)) {
      console.warn('bad configuration', config);
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
    console.log('--- starting trans:', name);
    try {
      fn(trans);
      this.removeTrans(trans);
      if (this.pending.length <= 0) {
        console.log('committing trans:', name);
        this.commit();
      } else {
        console.log(
          'not committing ',
          name,
          this.pending.length,
          'trans still in play'
        );
      }
    } catch (err) {
      console.log('redacting trans:', name, (err as Error).message);
      trans.fail(err as Error); // will removeTrans
      this.removeTrans(trans);
      console.log(
        '---- after redacting',
        name,
        ' state is',
        Array.from(this.items.values()).map((i: ForestItemIF) =>
          JSON.stringify(i.report())
        )
      );
      console.log('surviving pending trans:', this.pending.length);
      this.pending.forEach((t: TransIF) => {
        console.log('surviving transaction:', t.name, t.status);
      });
      throw err;
    }
  }

  removeTrans(trans: TransIF) {
    const index = this.pending.findIndex((t) => t.id === trans.id);
    if (index >= 0) {
      const rejects = this.pending.slice(index);
      this.pending = this.pending.slice(0, index);
      rejects.forEach((t) => {
        this.items.forEach((item: ForestItemIF) => {
          if (isTransactionalIF(item)) {
            item.removeTempValues(t.id);
          }
        });
      });
    }
  }

  commit() {
    this.items.forEach((item) => {
      item.commit();
    });
    this.items.forEach((item) => item.flushTemp());
  }
}
