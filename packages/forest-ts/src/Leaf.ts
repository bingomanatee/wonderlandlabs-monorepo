import { LeafObj, QueryDef, Tree } from './types'
import { map, Observer } from 'rxjs'

export class Leaf<ValueType> implements LeafObj<ValueType> {
  constructor(
    private $tree: Tree,
    private $collection: string,
    public $identity: any
  ) {
  }

  $subscribe(observer: Observer<LeafObj<ValueType>>) {
    return this.$query({})
      .pipe(
        map(([leaf]) => leaf)
      )
      .subscribe(observer);
  }

  $query(queryDef: Partial<QueryDef>) {
    return this.$getCollection.query(
      { ...queryDef, identity: this.$identity, collection: this.$collection }
    );
  }

  get $getCollection() {
    return this.$tree.collection(this.$collection)
  }

  get $value() {
    return this.$getCollection.get(this.$identity);
  }
}
