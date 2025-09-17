"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DistributedMap = void 0;
const constants_1 = require("../../constants");
const dataEngineTypes_1 = require("./dataEngineTypes");
/**
 * This is a datatype which is "mappish"
 * and keeps its field definitions distributed across
 * several branches' actions
 */
class DistributedMap {
    constructor(branch, manifest) {
        this.branch = branch;
        this.manifest = manifest;
    }
    has(key) {
        const { set, del, patch } = this.manifest;
        if (set) {
            if (set.key === key) {
                return set.val !== constants_1.DELETED;
            }
        }
        else if (patch) {
            if (patch.has(key)) {
                return patch.get(key) !== constants_1.DELETED;
            }
        }
        else if (del) {
            if ((0, dataEngineTypes_1.isSingleDel)(del)) {
                if (del.delKey === key) {
                    return false;
                }
                else {
                    if ((0, dataEngineTypes_1.isMultiDel)(del) && del.delKeys.includes(key)) {
                        return false;
                    }
                }
            }
        }
        if (this.branch.prev) {
            return this.branch.prev.value.has(key);
        }
        return false;
    }
    keys(keys) {
        if (!keys) {
            return this.branch.tree.root.value.keys(new Set());
        }
        const { del, patch, set } = this.manifest;
        if (set) {
            const { key, val } = set;
            if (val === constants_1.DELETED) {
                keys.delete(key);
            }
            else {
                keys.add(key);
            }
        }
        if (patch) {
            patch.forEach((val, key) => {
                if (val === constants_1.DELETED) {
                    keys.delete(key);
                }
                else
                    keys.add(key);
            });
        }
        if (this.branch.next) {
            return this.branch.next.value.keys(keys);
        }
        return keys;
    }
    clearCache() {
        if (this._map) {
            this._map.clear();
            this._map = undefined;
        }
        this.prevData?.clearCache();
    }
    get prevData() {
        if (!this.branch.prev)
            return undefined;
        return this.branch.prev.value;
    }
    get nextData() {
        if (!this.branch.next)
            return undefined;
        return this.branch.next.value;
    }
    map(map) {
        if (!map) {
            // todo: skip to the next define
            if (this._map) {
                //cached from previous map run.
                // the cached map should already be mutated according to this
                if (!this.branch.next) {
                    return new Map(this._map);
                }
                else {
                    return this.nextData.map(new Map(this._map));
                }
            }
            else {
                return this.branch.tree.top.value.map(new Map());
            }
        }
        // mutate the map accordig to the action
        map = this.branch.action.map(map, this);
        if (this.branch.next) {
            return this.nextData.map(map);
        }
        // cache the map if and only if this is the top $branch (for now...)
        this._map = new Map(map);
        if (this.branch.prev) {
            this.prevData.clearCache();
        }
        return map;
    }
    get(key) {
        if (this._map)
            return this._map.get(key);
        return this.branch.action.get(key, this);
    }
}
exports.DistributedMap = DistributedMap;
