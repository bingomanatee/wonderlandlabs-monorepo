"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.noSet = noSet;
const utils_1 = require("../../utils");
const Collection_1 = require("../Collection");
const deleteProxyFor_1 = require("./deleteProxyFor");
const setProxyFor_1 = require("./setProxyFor");
function noSet() {
    throw new Error("forest maps are immutable");
}
class MapCollection extends Collection_1.Collection {
    constructor(name, params, forest) {
        function mapCloner(cloneParams) {
            const { value } = cloneParams;
            if (!value[Symbol.iterator]) {
                console.log("attepmt to clone : params", cloneParams, "not a map:", value);
                throw new Error("cannot clone map - not iterable");
            }
            const out = new Map();
            value.forEach((v, k) => out.set(k, v));
            return out;
        }
        if (!(params.serializer && params.benchmarkInterval)) {
            {
                super(name, { ...params, benchmarkInterval: 20, serializer: mapCloner }, forest);
            }
        }
        else {
            super(name, { ...params, serializer: mapCloner }, forest);
        }
    }
    set(key, value) {
        if (this.tree.top) {
            if (utils_1.canProxy) {
                const next = (0, setProxyFor_1.setProxyFor)({
                    map: this.tree.top.value,
                    key,
                    value,
                });
                this.tree.next(next, "set");
            }
            else {
                const next = new Map(this.tree.top.value);
                next.set(key, value);
                this.tree.next(next, "set");
            }
        }
        else {
            this.tree.next(new Map([[key, value]]), "set");
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
            this.tree.next(next, "deleteMany");
        }
        else {
            const next = new Map(this.tree.top.value);
            for (const key of keys) {
                next.delete(key);
            }
            this.tree.next(next, "deleteMany");
        }
    }
    get(key) {
        if (!this.tree.top) {
            return undefined;
        }
        return this.tree.top.value.get(key);
    }
    replace(map) {
        this.tree.next(map, "replace");
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
