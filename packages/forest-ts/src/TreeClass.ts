import { c } from '@wonderlandlabs/collect';
import { text } from '@wonderlandlabs/walrus';

import { sortBy } from 'lodash';

import {
  CollectionDef, DoProps,
  isQueryCollectionDefJoin,
  isQueryNamedDefJoin,
  JoinSchema,
  LeafObj,
  QueryDef,
  QueryDefJoin,
  TransAction,
  TreeIF,
  UpdateMsg
} from './types';
import CollectionClass from './CollectionClass';
import { ErrorPlus } from './ErrorPlus';
import { Leaf } from './Leaf';
import { Subject, SubjectLike } from 'rxjs';
import JoinIndex from './JoinIndex';
import TransManager from './TransManager';

function prefix(item: string | string[]): string[] {
  if (typeof item === 'string') {
    return prefix([ item ]);
  }

  return item.map((str) => {
    return text.addBefore(str, '$value.');
  });
}

/**
 * A Tree is a "local database" -- a collection of collections and the definitions
 * of how the records are related to each other.
 */
export class TreeClass implements TreeIF {
  constructor(collections?: CollectionDef[], joins?: JoinSchema[]) {
    collections?.forEach((coll) => this.addCollection(coll));
    joins?.forEach((join) => this.addJoin(join));
  }

  public $collections: Map<string, CollectionClass> = new Map();

  public joins: Map<string, JoinSchema> = new Map();

  public addCollection(config: CollectionDef) {
    if (!config.name) {
      throw new Error('addCollection requires name');
    }
    if (this.$collections.has(config.name)) {
      throw new Error('cannot redefine collection ' + config.name);
    }

    const records = config.records ?? [];
    delete config.records;

    this.$collections.set(config.name, new CollectionClass(this, config, records));
    this.updates.next({
      action: 'add-collection',
      collection: config.name
    });
  }

  private _indexes: Map<string, JoinIndex> = new Map();

  public addJoin(join: JoinSchema) {
    if (this.joins.has(join.name)) {
      throw new ErrorPlus('cannot redefine existing join ' + join.name, { join, tree: this });
    }
    this.joins.set(join.name, join);
    this._indexes.set(join.name, new JoinIndex(this, join.name));
  }

  private $_transManager?: TransManager;

  /** perform a synchronous task that is emveloped by
   * transactional fallback
   */
  do(action: TransAction, props?: DoProps) {
    if (!this.$_transManager) {
      this.$_transManager = new TransManager(this);
    }
    const handler = this.$_transManager.start(props);
    try {
      const out = action(this);
      handler.complete();
      return out;
      return out;
    } catch (err) {
      handler.fail(err);
    }
  }

  collection(name: string): CollectionClass {
    if (!this.$collections.has(name)) {
      throw new ErrorPlus('cannot get collection', name);
    }
    return this.$collections.get(name)!;
  }

  get(collection: string, id: any): any {
    return this.collection(collection).get(id);
  }

  put(collection: string, value: any) {
    if (!this.$collections.has(collection)) {
      throw new ErrorPlus('TreeClass.put: missing target collection', {
        collection, value
      });
    }
    return this.collection(collection).put(value);
  }

  query(query: QueryDef) {
    return this.collection(query.collection).query(query);
  }

  fetch(query: QueryDef): any {
    return this.collection(query.collection).fetch(query);
  }

  findMatchingJoins(collection: string, coll2: string) {
    return c(this.joins).getReduce((list, join: JoinSchema) => {
      if (join.from === collection && join.to === coll2) {
        list.push(join);
      } else if (join.to === collection && join.from === coll2) {
        list.push(join);
      }

      return list;
    }, []);
  }

  leaf(collection: string, id: any, query?: QueryDefJoin): LeafObj<any> {
    const leaf = new Leaf(this, collection, id);

    if (query?.joins) {
      query.joins.forEach((join) => {
        let joinDef;
        if (isQueryNamedDefJoin(join)) {
          if (!this.joins.has(join.name)) {
            throw new ErrorPlus('cannot find query join ' + join.name, join);
          }
          if (!this._indexes.has(join.name)) {
            throw new ErrorPlus('no index for join ' + join.name, join);
          }
          joinDef = this.joins.get(join.name)!;
        } else if (isQueryCollectionDefJoin(join)) {
          const matches = this.findMatchingJoins(collection, join.collection);
          switch (matches.length) {
          case 0:
            throw new Error(`cannot find amy joins between ${collection} and ${join.collection}`);
            break;

          case 1:
            joinDef = matches[0];
            break;

          default:
            throw new ErrorPlus(`there are two or more joins between ${collection} and ${join.collection} -- you must name the specific join you want to use`,
              query);
          }
        } else {
          throw new ErrorPlus('join is not proper', join);
        }
        let index;
        try {
          index = this._indexes.get(joinDef.name)!;
        } catch (err) {
          console.log('---- error getting index for ', joinDef, 'from join', join);
          throw err;
        }

        if (joinDef.to === collection) {
          leaf.$joins[joinDef.name] = index.toLeafsFor(id, join);
        } else {
          leaf.$joins[joinDef.name] = index.fromLeafsFor(id, join);
        }
        if (join.sorter) {
          if (typeof join.sorter === 'function') {
            leaf.$joins[joinDef.name] = leaf.$joins[joinDef.name].sort(join.sorter);
          } else {
            leaf.$joins[joinDef.name] = sortBy(leaf.$joins[joinDef.name], prefix(join.sorter));
          }
        }
      });
    }

    return leaf;
  }

  updates: SubjectLike<UpdateMsg> = new Subject();

  has(coll: string, id: any) {
    const c = this.collection(coll);
    if (!c) {
      return false;
    }
    return c.has(id);
  }
}
