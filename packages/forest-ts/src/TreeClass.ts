import { CollectionDef, LeafObj, QueryDef, TransAction, Tree } from './types'
import CollectionClass from './CollectionClass'
import { ErrorPlus } from './ErrorPlus'
import { Leaf } from './Leaf'

export class TreeClass implements Tree {
  public $collections: Map<string, CollectionClass> = new Map();

  public addCollection(content: CollectionDef, values?: any[]) {
    if (!content.name) {
      throw new Error('addCollection requires name');
    }
    if (this.$collections.has(content.name)) {
      throw new Error('cannot redefine collection ' + content.name);
    }

    this.$collections.set(content.name, new CollectionClass(this, content, values));
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

  leaf(collection: string, id: any): LeafObj<any> {
    return new Leaf(this, collection, id)
  }

}
