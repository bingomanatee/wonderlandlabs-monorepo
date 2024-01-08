import { LeafObj, LeafRecord, Tree } from './types';
import { TreeClass } from './TreeClass';
import { Subscription } from 'rxjs';


export default class LeafSnapshot implements LeafObj<unknown> {
  public $value: LeafRecord;

  constructor(private $tree: TreeClass,
    public $collection: string,
    public $identity: unknown,
  ) {
    this.$value = $tree.get($collection, $identity)?.value;
  }

  toJSON() {
    return {
      value: this.$value,
      collection: this.$collection,
      identity: this.$identity
    };
  }

  $subscribe() {
    throw new Error('LeafSnapshot does not imlplement $subscribe');
    return new Subscription();
  }

  public static fromLeafObj(leaf: LeafObj<any>) {
    return new LeafSnapshot(leaf.$identity, leaf.$collection, leaf.$identity);
  }
}