import isEqual from 'lodash.isequal'
import { c } from '@wonderlandlabs/collect'
import { LeafId, LeafObj } from './types'
import { v4 } from 'uuid'
import { FormEnum } from '@wonderlandlabs/walrus/dist/enums'
import { Tree } from './types'

class TreePending {
  public $id: string;

  constructor(public type: string, name: string, options: string) {
    this.$id = v4();
  }

  private backups?: Map<LeafId, any>


  has(leafId: LeafId) {
    return this.backups?.has(leafId);
  }

  public get(leafId: LeafId) {
    return this.backups?.get(leafId);
  }

  backup(leafId: LeafId, value: any) {
    if (!this.backups) {
      this.backups = new Map();
    }
    this.backups.set(leafId, value);
  }

}

export class TreeClass implements Tree {
  constructor(private root: LeafObj<any>) {
    this.addLeaf(root);
  }

  private leaves: Map<string, LeafObj<any>> = new Map();

  addLeaf(leaf: LeafObj<any>) {
    this.leaves.set(leaf.$id, leaf);
  }

  value(leafId: LeafId) {
    const pending = this.pending.find((pending: TreePending) => pending.has(leafId));
    const leaf = this.leaves.get(leafId);
    if (!leaf) {
      throw new Error(`cannot identify leaf ${leafId}`);
    }
    const base = pending ? pending.get(leafId) : leaf.$subject.value;

    return composeValue(base, leaf);
  }

  private pending: TreePending[] = [];

  private get lastPending(): TreePending | null {
    return this.pending.length ? this.pending[this.pending.length - 1] : null;
  }

  update(leafId: LeafId, value: any) {
    const leaf = this.leaves.get(leafId);
    if (!leaf) {
      throw new Error(`write: cannot find ${leafId}`)
    }

    if (!this.pending.length) { // should probably never happen - all writes should be transactionally wrapped but...
      leaf.$subject.next(value);
    } else {
      const backup = this.pending.find((pending) => pending.has(leafId));
      if (!backup) {
        this.lastPending!.backup(leafId, leaf.$value);
      }

      leaf.$subject.next(value);
    }
  }
}

function composeValue(value: any, leaf: LeafObj<any>): any {
  let con = c(value).clone();

  if (con.family === FormEnum.container) {
    leaf.$children?.forEach((leaf, name) => {
      con.set(name, leaf.$value)
    });
  }

  return con.value
}
