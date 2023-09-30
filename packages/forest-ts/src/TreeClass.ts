import { CollectionDef, JoinObj, JoinSchema, LeafObj, QueryDef, TransAction, Tree, UpdateMsg } from './types'
import CollectionClass from './CollectionClass'
import { ErrorPlus } from './ErrorPlus'
import { Leaf } from './Leaf'
import { Subject, SubjectLike } from 'rxjs'
import JoinIndex from './JoinIndex'

export class TreeClass implements Tree {
  public $collections: Map<string, CollectionClass> = new Map();

  public joins: Map<string, JoinSchema> = new Map();

  constructor(collections?: CollectionDef[], joins?: JoinSchema[]) {
    collections?.forEach((coll) => this.addCollection(coll));
    joins?.forEach((join) => this.addJoin(join));
  }

  public addCollection(content: CollectionDef) {
    if (!content.name) {
      throw new Error('addCollection requires name');
    }
    if (this.$collections.has(content.name)) {
      throw new Error('cannot redefine collection ' + content.name);
    }

    let values = content.values ?? [];
    delete content.values;

    this.$collections.set(content.name, new CollectionClass(this, content, values));
    this.updates.next({
      action: 'add-collection',
      collection: content.name
    })
  }

  private _indexes: Map<string, JoinIndex> = new Map();

  public addJoin(join: JoinSchema) {
    if (this.joins.has(join.name)) {
      throw new ErrorPlus('cannot redefine existing join ' + join.name, { join, tree: this })
    }
    this.joins.set(join.name, join);
    this._indexes.set(join.name, new JoinIndex(this, join.name));
  }

  do(action: TransAction) {
    return action(this);
  }

  collection(name: string): CollectionClass {
    if (!this.$collections.has(name)) {
      throw new ErrorPlus('cannot get collection', name)
    }
    return this.$collections.get(name)!;
  }

  get(collection: string, id: any): any {
    return this.collection(collection).get(id);
  }

  put(collection: string, value: any) {
    return this.collection(collection).put(value);
  }

  query(query: QueryDef) {
    return this.collection(query.collection).query(query);
  }

  fetch(query: QueryDef): any {
    return this.collection(query.collection).fetch(query);
  }

  leaf(collection: string, id: any, query?: JoinObj): LeafObj<any> {
    const leaf = new Leaf(this, collection, id);

    if (query?.joins) {
      query.joins.forEach((join) => {
        if (!this.joins.has(join.name)) {
          throw new ErrorPlus('cannot find query join', join);
        }
        if (!this._indexes.has(join.name)) {
          throw new ErrorPlus('no index for join', join);
        }
        const index = this._indexes.get(join.name)!;
        const joinDef = this.joins.get(join.name)!;

        if (joinDef.to === collection) {
          console.log('.... getting joins: to for ', collection, 'id', id);
          leaf.$joins[join.name] = index.toLeafsFor(id, join);
        } else {
          console.log('.... getting joins: from for ', collection, 'id', id);
          leaf.$joins[join.name] = index.fromLeafsFor(id, join);
        }
      })
    }

    return leaf;
  }

  updates: SubjectLike<UpdateMsg> = new Subject()
}
