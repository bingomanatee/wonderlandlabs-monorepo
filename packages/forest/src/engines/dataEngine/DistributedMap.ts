import { DELETED } from "../../constants";
import { BranchIF, KeyVal } from "../../types";
import {
  DataEngineAction,
  DataEngineMap,
  DelVal,
  isMultiDel,
  isSingleDel,
} from "./dataEngineTypes";

export type DistMapManifestSet = {
  set: KeyVal;
};

export type DistMapManifestDel = {
  del: DelVal;
};

export type DistMapManifestPatch = {
  patch?: DataEngineMap;
};
export type DistMapManifest =
  | DistMapManifestSet
  | DistMapManifestPatch
  | DistMapManifestDel;

/**
 * This is a datatype which is "mappish"
 * and keeps its field definitions distributed across
 * several branches' actions
 */
export class DistributedMap {
  constructor(public branch: BranchIF, public manifest: DistMapManifest) {}

  has(key: unknown): boolean {
    const { set, del, patch } = this.manifest;
    if (set) {
      if (set.key === key) {
        return set.val !== DELETED;
      }
    } else if (patch) {
      if (patch.has(key)) {
        return patch.get(key) !== DELETED;
      }
    } else if (del) {
      if (isSingleDel(del)) {
        if (del.delKey === key) {
          return false;
        } else {
          if (isMultiDel(del) && del.delKeys.includes(key)) {
            return false;
          }
        }
      }
    }

    if (this.branch.prev) {
      return (this.branch.prev.value as DistributedMap).has(key);
    }
    return false;
  }

  keys(keys?: Set<unknown>): Set<unknown> {
    if (!keys) {
      return (this.branch.tree.root.value as DistributedMap).keys(
        new Set() as Set<unknown>
      );
    }
    const { del, patch, set } = this.manifest;
    if (set) {
      const { key, val } = set;
      if (val === DELETED) {
        keys.delete(key);
      } else {
        keys.add(key);
      }
    }
    if (patch) {
      patch.forEach((val, key) => {
        if (val === DELETED) {
          keys.delete(key);
        } else keys.add(key);
      });
    }
    if (this.branch.next) {
      return (this.branch.next!.value as DistributedMap).keys(keys);
    }
    return keys;
  }

  private _map?: DataEngineMap;
  public clearCache() {
    if (this._map) {
      this._map.clear();
      this._map = undefined;
    }
    this.prevData?.clearCache();
  }

  get prevData(): DistributedMap | undefined {
    if (!this.branch.prev) return undefined;
    return this.branch.prev.value as DistributedMap;
  }

  get nextData(): DistributedMap | undefined {
    if (!this.branch.next) return undefined;
    return this.branch.next.value as DistributedMap;
  }

  map(map?: DataEngineMap): DataEngineMap {
    if (!map) {
      // todo: skip to the next define
      if (this._map) {
        //cached from previous map run.
        // the cached map should already be mutated according to this
        if (!this.branch.next) {
          return new Map(this._map);
        } else {
          return this.nextData!.map(new Map(this._map));
        }
      } else {
        return (this.branch.tree.top.value as DistributedMap).map(new Map());
      }
    }

    // mutate the map accordig to the action
    map = (this.branch.action as DataEngineAction).map(map, this);

    if (this.branch.next) {
      return this.nextData!.map(map);
    }

    // cache the map if and only if this is the top branch (for now...)
    this._map = new Map(map);
    if (this.branch.prev) {
      this.prevData!.clearCache();
    }
    return map;
  }

  get(key: unknown): unknown {
    if (this._map) return this._map.get(key);
    return (this.branch.action as DataEngineAction).get(key, this);
  }
}
