import { map, Observer, Subscription } from 'rxjs';
import { c } from '@wonderlandlabs/collect';
import { TreeIF, QueryDef, isLeafJSON, LeafObj, LeafObjJSONJoins, DataID, Data } from './types';
import { idStr } from './utils';

/**
 * a leaf is a dynamic _reference_ ("pointer") to a record.
 * It has the fields necessary to get the data from the tree.
 * It may also have one or more joined records, identified in $joins,
 */
export class Leaf implements LeafObj {
  constructor(
    private $tree: TreeIF,
    public $collection: string, // should be collectionName maybe?
    public $identity: DataID
  ) {
  }

  $subscribe(observer: Observer<LeafObj>): Subscription {
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

  get $value(): Data {
    if (!this.$exists) {
      throw new Error(`the record ${idStr(this.$identity)} has been removed from ${this.$collection}`);
    }
    return this.$getCollection.get(this.$identity)!;
  }

  get $exists() {
    return this.$getCollection.has(this.$identity);
  }

  /**
   * the records related to this one, joined to a specific target "name" which is its identity
   */
  public $joins: Record<string, LeafObj[]> = {};

  /**
   * returns a "POJO" snapshot of the data in the tree.
   */
  public toJSON() {
    if (!this.$exists || this.$value === undefined) {
      return {
        identity: this.$identity,
        collection: this.$collection,
        $exists: false,
      };
    }
    const joins: LeafObjJSONJoins = {};
    const out = {
      value: this.$value,
      identity: this.$identity,
      collection: this.$collection,
      joins: joins
    };
    c(this.$joins).forEach((leafs: LeafObj[], identity) => {
      out.joins[identity] = leafs.map((leaf) => leaf.toJSON()).filter(isLeafJSON);
    });
    return out;
  }
}
