import { Tree } from "./Tree";
import { ErrorPlus } from "./ErrorPlus";
import {
  CollectionIF,
  Data,
  DataID,
  JoinSchema,
  QueryDefJoin,
  UpdateMsg,
} from "./types";
import { c } from "@wonderlandlabs/collect";

function upsertIntoMap(m: Map<any, any>, key: any, value: any) {
  if (m.has(key)) {
    m.get(key).push(value);
  } else {
    m.set(key, [value]);
  }
}

export default class JoinIndex {
  constructor(
    public tree: Tree,
    public joinName: string,
  ) {
    const self = this;
    this.tree.updates.subscribe({
      next(msg: UpdateMsg) {
        if (
          self.join.to === msg.collection ||
          self.join.from === msg.collection
        ) {
          self.clearCache();
        }
      },
    });
  }

  clearCache() {
    this.isGenerated = false;
    this.fromIndex = new Map();
    this.toIndex = new Map();
  }

  get join(): JoinSchema {
    const schema = this.tree.joins.get(this.joinName);
    if (!schema) {
      throw new ErrorPlus("missing join schema", this);
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

  get fromColl(): CollectionIF {
    const coll = this.tree.collection(this.join.from);
    if (!coll) {
      throw new ErrorPlus("cannot find from collection", this);
    }
    return coll;
  }

  get toColl() {
    const coll = this.tree.collection(this.join.to);
    if (!coll) {
      throw new ErrorPlus("cannot find from collection", this);
    }
    return coll;
  }

  private generateFromFieldToToField() {
    // generate in the case where both fromField and toField exist.
    const { join, fromColl, toColl } = this;
    const { fromField, toField } = join;

    const toMap = c(toColl.values).getReduce((m, record: Data, identity) => {
      if (!(toField! in record)) {
        return m;
      }
      const key = record[toField!];
      upsertIntoMap(toMap, key, identity);
      return m;
    });

    fromColl.values.forEach((fromData: Data, fromIdentity: any) => {
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

    fromColl.values.forEach((fromData: Data, fromIdentity: any) => {
      if (!(fromField && fromField in fromData)) {
        return;
      }
      const toId: DataID = fromData[fromField] as DataID;

      if (toColl.has(toId)) {
        this._index(fromIdentity, toId);
      }
    });
  }

  private generateFromIdToToField() {
    const { join, fromColl, toColl } = this;
    const { toField } = join;
    toColl.values.forEach((toData: Data, toIdentity: any) => {
      if (!toField || !(toField in toData)) {
        return;
      }
      const fromId: DataID = toData[toField] as DataID;
      if (fromColl.has(fromId)) {
        this._index(fromId, toIdentity);
      }
    });
  }

  private generateFromIdToToId() {
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
    if (!this.toIndex.has(id)) {
      return [];
    }
    const toIndexes = this.toIndex.get(id)!;

    return toIndexes.map((fromId: any) =>
      this.tree.leaf(this.join.from, fromId, join),
    );
  }

  fromLeafsFor(id: any, join?: QueryDefJoin) {
    if (!this.isGenerated) {
      this.generate();
    }
    if (!this.fromIndex.has(id)) {
      return [];
    }
    const fromIndexes = this.fromIndex.get(id)!;
    return fromIndexes.map((toId: any) =>
      this.tree.leaf(this.join.to, toId, join),
    );
  }
}
