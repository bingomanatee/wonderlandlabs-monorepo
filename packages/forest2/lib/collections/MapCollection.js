"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canProxy = void 0;
exports.isMapKey = isMapKey;
exports.noSet = noSet;
const Collection_1 = require("./Collection");
const setProxy_1 = require("./setProxy");
const m = new Map();
function* NullIterator() {
    return { next: () => ({ done: true }) };
}
function isMapKey(map, a) {
    if (a === Symbol.iterator)
        return true;
    // @ts-ignore 7052
    return map instanceof Map && a in map;
}
function noSet() {
    throw new Error("forest maps are immutable");
}
exports.canProxy = typeof Proxy === "function";
class MapCollection extends Collection_1.Collection {
    constructor(name, params) {
        super(name, params);
    }
    set(key, value) {
        if (this.tree.top) {
            const next = (0, setProxy_1.setProxy)(this.tree.top.value, key, value);
            this.tree.grow({ next });
        }
        else {
            this.tree.grow({ next: new Map([[key, value]]) });
        }
    }
    get(key) {
        if (!this.tree.top) {
            return undefined;
        }
        return this.tree.top.value.get(key);
    }
    get size() {
        if (!this.tree.top)
            return 0;
        return this.tree.top.value.size;
    }
    forEach(iter) {
        if (!this.tree.top)
            return;
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
