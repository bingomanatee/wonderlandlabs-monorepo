"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMapKey = isMapKey;
exports.noSet = noSet;
const utils_1 = require("../../utils");
const Collection_1 = require("../Collection");
const deleteProxyFor_1 = require("./deleteProxyFor");
const setProxyFor_1 = require("./setProxyFor");
function isMapKey(map, a) {
    if (a === Symbol.iterator) {
        return true;
    }
    // @ts-ignore 7052
    return map instanceof Map && a in map;
}
function noSet() {
    throw new Error('forest maps are immutable');
}
class MapCollection extends Collection_1.Collection {
    constructor(name, params) {
        super(name, params);
    }
    set(key, value) {
        if (this.tree.top) {
            if (utils_1.canProxy) {
                const next = (0, setProxyFor_1.setProxyFor)({
                    map: this.tree.top.value,
                    key,
                    value,
                });
                this.tree.grow({ next });
            }
            else {
                const next = new Map(this.tree.top.value);
                next.set(key, value);
                this.tree.grow({ next });
            }
        }
        else {
            this.tree.grow({ next: new Map([[key, value]]) });
        }
    }
    delete(key) {
        return this.deleteMany([key]);
    }
    deleteMany(keys) {
        if (!this.tree.top) {
            return;
        }
        if (utils_1.canProxy) {
            const next = (0, deleteProxyFor_1.deleteProxyFor)({
                map: this.tree.top.value,
                keys,
            });
            this.tree.grow({ next });
        }
        else {
            const next = new Map(this.tree.top.value);
            for (const key of keys) {
                next.delete(key);
            }
            this.tree.grow({ next });
        }
    }
    get(key) {
        if (!this.tree.top) {
            return undefined;
        }
        return this.tree.top.value.get(key);
    }
    replace(map) {
        this.tree.grow({ next: map });
    }
    clear() {
        this.replace(new Map());
    }
    get size() {
        if (!this.tree.top) {
            return 0;
        }
        return this.tree.top.value.size;
    }
    forEach(iter) {
        if (!this.tree.top) {
            return;
        }
        this.tree.top.value.forEach(iter);
    }
    keys() {
        const tree = this.tree;
        return {
            [Symbol.iterator]: function* () {
                if (tree.top) {
                    for (const out of tree.top.value.keys()) {
                        yield out;
                    }
                }
            },
        };
    }
    values() {
        const tree = this.tree;
        return {
            [Symbol.iterator]: function* () {
                if (tree.top) {
                    for (const out of tree.top.value.values()) {
                        yield out;
                    }
                }
            },
        };
    }
}
exports.default = MapCollection;
