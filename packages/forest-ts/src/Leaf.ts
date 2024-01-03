import { isLeafJSON, LeafObj, LeafObjJSONJoins, QueryDef, Tree } from './types';
import { map, Observer, Subscription } from 'rxjs';
import { c } from '@wonderlandlabs/collect';

/**
 * a leaf is a dynamic _reference_ ("pointer") to a record.
 * It has the fields necessary to get the data from the tree.
 * It may also have one or more joined records, identified in $joins,
 */
export class Leaf<ValueType> implements LeafObj<ValueType> {
  constructor(
    private $tree: Tree,
    private $collection: string, // should be collectionName maybe?
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

  /**
   * the records related to this one, joined to a specific target "name" which is its identity
   */
  public $joins: Record<string, LeafObj<any>[]> = {};

  /**
   * returns a "POJO" snapshot of the data in the tree.
   */
  public toJSON() {
    if (!this.$exists) {
      return {
        identity: this.$identity,
        collection: this.$collection,
        value: undefined,
        $exists: false,
      };
    }

    const joins: LeafObjJSONJoins = {};
    c(this.$joins).forEach((leafs: LeafObj<any>[], identity) => {
      joins[identity] = leafs.map((leaf) => leaf.toJSON()).filter(isLeafJSON);
    });
    return {
      value: this.$value,
      identity: this.$identity,
      collection: this.$collection,
      joins: joins
    };
  }
}
