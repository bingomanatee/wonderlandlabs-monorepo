import { TreeClass } from './TreeClass'
import { ErrorPlus } from './ErrorPlus'
import { JoinSchema, LeafRecord, QueryDefJoin, UpdateMsg } from './types'
import CollectionClass from './CollectionClass'
import { c } from '@wonderlandlabs/collect'

function upsertIntoMap(m: Map<any, any>, key: any, value: any) {
  if (m.has(key)) {
    m.get(key).push(value)
  } else {
    m.set(key, [value])
  }
}

export default class JoinIndex {
  constructor(public tree: TreeClass, public joinName: string) {
    const self = this;
    this.tree.updates.subscribe({
      next(msg: UpdateMsg) {
        if (self.join.to === msg.collection || self.join.from === msg.collection) {
          self.clearCache();
        }
      }
    });
  }

  clearCache() {
    console.log('---- clear cache---');
    this.isGenerated = false;
    this.fromIndex = new Map();
    this.toIndex = new Map();
  }

  get join(): JoinSchema {
    const schema = this.tree.joins.get(this.joinName);
    if (!schema) {
      throw new ErrorPlus('missing join schema', this);
    }
    return schema;
    //@TODO: validate
  }

  public fromIndex = new Map();
  public toIndex = new Map();
  private isGenerated = false;

  private _index(fromId: any, toId: any) {
    upsertIntoMap(this.fromIndex, fromId, toId);
    upsertIntoMap(this.toIndex, toId, fromId);
  }

  get fromColl(): CollectionClass {
    const coll = this.tree.collection(this.join.from);
    if (!coll) {
      throw new ErrorPlus('cannot find from collection', this);
    }
    return coll;
  }

  get toColl() {
    const coll = this.tree.collection(this.join.to);
    if (!coll) {
      throw new ErrorPlus('cannot find from collection', this);
    }
    return coll;
  }

  private generateFromFieldToToField() { // generate in the case where both fromField and toField exist.
    const { join, fromColl, toColl } = this;
    const { fromField, toField } = join;
    console.log('gen frofield/tofield')

    let toMap = c(toColl.values).getReduce((m, record: LeafRecord, identity, any) => {
      let key;
      if (!(toField! in record)) {
        return m;
      }
      key = record[toField!];

      upsertIntoMap(toMap, key, identity);
      return m;
    })

    fromColl.values.forEach((fromData: LeafRecord, fromIdentity: any) => {
      if (!(fromField! in fromData)) {
        return;
      }
      const key = fromData[fromField!];
      const toIds = toMap.get(key);
      if (toIds) {
        for (const toId of toIds) {
          this._index(fromIdentity, toId);
        }
      }
    });
  }

  generate() {
    this.fromIndex = new Map();
    this.toIndex = new Map();

    if (this.join.fromField) {
      this.generateFromFieldToToId();
      if (this.join.toField) {
        this.generateFromFieldToToField();
      }
    } else if (this.join.toField) {
      this.generateFromIdToToField();
    } else {
      this.generateFromIdToToId(); // wierd but whatever
    }
    this.isGenerated = true;
  }

  private generateFromFieldToToId() {
    const { join, fromColl, toColl } = this;
    const { fromField } = join;
    console.log('gen frofield/toId')

    fromColl.values.forEach((fromData: LeafRecord, fromIdentity: any) => {
      console.log('--- fromData:', fromData, 'id = ', fromIdentity);

      if (!(fromField! in fromData)) {
        return;
      }
      const toId = fromData[fromField!];

      if (toColl.has(toId)) {
        console.log('indexing', fromIdentity, toId);
        this._index(fromIdentity, toId);
      } else {
        console.log('--- no fk ', toId);
      }
    });
  }

  private generateFromIdToToField() {
    const { join, fromColl, toColl } = this;
    const { toField } = join;
    console.log('gen fromid/toField')
    toColl.values.forEach((toData: LeafRecord, toIdentity: any) => {
      if (!(toField! in toData)) {
        return;
      }
      const fromId = toData[toField!];
      if (fromColl.has(fromId)) {
        this._index(fromId, toIdentity);
      }
    });
  }

  private generateFromIdToToId() {
    console.log('gen fromid/toid')
    const { fromColl, toColl } = this;
    for (const fromId in fromColl.values.keys()) {
      if (toColl.has(fromId)) {
        this._index(fromId, fromId);
      }
    }
  }

  toLeafsFor(id: any, join?: QueryDefJoin) {
    if (!this.isGenerated) {
      this.generate();
    }
    console.log(id, 'TLF: toIndexFor --- index = ', this.toIndex, 'join = ', this.join.from, '...', this.join.to);
    if (!this.toIndex.has(id)) {
      return [];
    }
    const toIndexes = this.toIndex.get(id)!;

    console.log("indexes = ", toIndexes)
    return toIndexes.map((fromId: any) => this.tree.leaf(this.join.from, fromId, join))
  }

  fromLeafsFor(id: any, join?: QueryDefJoin) {
    if (!this.isGenerated) {
      this.generate();
    }
    console.log(id, 'FLF fromIndex --- index = ', this.fromIndex, 'join = ', this.join.from, '...', this.join.to);
    if (!this.fromIndex.has(id)) {
      console.log('FLF no match for id', id);
      return [];
    }
    const fromIndexes = this.fromIndex.get(id)!;
    return fromIndexes.map((toId: any) => this.tree.leaf(this.join.to, toId, join))
  }
}
