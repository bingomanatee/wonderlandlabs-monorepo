import { c } from "@wonderlandlabs/collect";
import { DELETED, NOT_FOUND } from "./constants";
import { Action_s, DataType, DataType_s } from "./helpers/enums";
import { Mappy, RefParams } from "./helpers/paramTypes";
import { BranchIF, GenObj, LeafIF, RefIF, TreeIF } from "./types";
import { Ref } from "./Ref";
import { collectObj, collectOpts } from "@wonderlandlabs/collect/lib/types";

type KeyValue = {
  key: unknown;
  val: unknown;
};

function empty(type: DataType): GenObj | Mappy {
  let out;
  switch (type) {
    case DataType_s.map:
      out = new Map();
      break;

    case DataType_s.object:
      out = {} as GenObj;
      break;

    default:
      throw new Error("cannot make empty from unknown datatype");
  }
  return out;
}

function setValue(type: DataType, params: KeyValue) {
  let out = empty(type);
  switch (type) {
    case DataType_s.map:
      (out as Mappy).set(params.key, params.val);
      break;

    case DataType_s.object:
      const key = params.key as string;
      (out as GenObj)[key] = params.val;
      break;

    default:
      throw new Error("cannot make empty from unknown datatype");
  }
  return out;
}

function mergeInto(type: DataType, v1: unknown, v2: unknown): unknown {
  throw new Error("not implemented");
}

export default class Leaf implements LeafIF {
  constructor(private tree: TreeIF, public branch: BranchIF, params: GenObj) {
    this.value = this._initValue(params);
  }
  value: unknown;

  private _initValue(params: GenObj) {
    switch (this.cause) {
      case Action_s.set:
        this.value = setValue(this.type, params as KeyValue);
        break;

      case Action_s.clear:
        this.value = empty(this.type);
        break;

      case Action_s.del:
        let dp = params as KeyValue;
        dp.val = DELETED;
        this.value = setValue(this.type, dp);
        break;
    }
  }

  private _myC?: collectObj;

  get myC() {
    if (!this._myC) {
      this._myC = c(this.value);
    }
    return this._myC;
  }

  get type() {
    return this.tree.dataType;
  }

  get cause() {
    return this.branch.cause;
  }

  mergeInto(defaultVal: unknown): unknown {
    let src = c(defaultVal).clone();
    this.myC.forEach((val: unknown, key: unknown) => {
      if (val === DELETED) src.deleteKey(key);
      else src.set(key, val);
    });
    return src.value;
  }

  destroy(): void {
    throw new Error("Method not implemented.");
  }
  get keys(): any[] {
    let keys: any[] = [];
    this.myC.forEach((val, key) => {
      if (val !== DELETED) {
        keys.push(key);
      }
    });
    return keys;
  }

  get deletedKeys(): any[] {
    let keys: any[] = [];
    this.myC.forEach((val, key) => {
      if (val === DELETED) {
        keys.push(key);
      }
    });
    return keys;
  }

  ref(key: unknown): RefIF<unknown, unknown> {
    let val = this.get(key);
    if (val === DELETED) val = NOT_FOUND;
    return new Ref({
      treeName: this.branch.tree.name,
      key,
      val,
    });
  }
  get(key: unknown): unknown {
    return this.has(key) ? this.myC.get(key) : NOT_FOUND;
  }

  has(key: unknown, local?: boolean): boolean {
    if (this.myC.hasKey(key) && this.get(key) !== DELETED) {
      return true;
    }
    if (this.cause == Action_s.summary) {
      // don't investigate further;
      return false;
    }
    if (!this.branch.prev) {
      return false;
    }
    return this.branch.prev.leaf.has(key);
  }

  set(key: unknown, val: unknown): void {
    this.branch.push(
      this.branch.tree.makeBranch({
        cause: Action_s.set,
        data: { key, val },
      })
    );
  }

  del(key: unknown): void {
    this.branch.push(
      this.branch.tree.makeBranch({
        cause: Action_s.del,
        key,
      })
    );
  }

  clear(): void {
    this.branch.push(
      this.branch.tree.makeBranch({
        cause: Action_s.clear,
      })
    );
  }
}
