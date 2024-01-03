import { LeafObj, LeafObjJSONJoins, QueryDef, Tree } from './types';
import { map, Observer, Subscription } from 'rxjs';
import { c } from '@wonderlandlabs/collect';

export class Leaf<ValueType> implements LeafObj<ValueType> {
  constructor(
    private $tree: Tree,
    private $collection: string,
    public $identity: any
  ) {
  }

  $subscribe(observer: Observer<LeafObj<ValueType>>): Subscription {
    return this.$query({})
      .pipe(
        map(([ leaf ]) => leaf)
      )
      .subscribe(observer);
  }

  $query(queryDef: Partial<QueryDef>) {
    return this.$getCollection.query(
      { ...queryDef, identity: this.$identity }
    );
  }

  get $getCollection() {
    return this.$tree.collection(this.$collection);
  }

  get $value() {
    if (!this.$exists) {
      throw new Error('the record ' + this.$identity + ' has been removed from ' + this.$collection);
    }
    return this.$getCollection.get(this.$identity);
  }

  get $exists() {
    return this.$getCollection.has(this.$identity);
  }

  public $joins: Record<string, LeafObj<any>[]> = {};

  public toJSON() {
    const joins: LeafObjJSONJoins = {};
    c(this.$joins).forEach((leafs: LeafObj<any>[], identity) => {
      joins[identity] = leafs.map((leaf) => leaf.toJSON());
    });
    return {
      value: this.$value,
      identity: this.$identity,
      collection: this.$collection,
      joins: joins
    };
  }
}
