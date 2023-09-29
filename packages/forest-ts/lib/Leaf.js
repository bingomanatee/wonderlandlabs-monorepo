"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Leaf = void 0;
const rxjs_1 = require("rxjs");
class Leaf {
    constructor($tree, $collection, $identity) {
        this.$tree = $tree;
        this.$collection = $collection;
        this.$identity = $identity;
    }
    $subscribe(observer) {
        return this.$query({})
            .pipe((0, rxjs_1.map)(([leaf]) => leaf))
            .subscribe(observer);
    }
    $query(queryDef) {
        return this.$getCollection.query(Object.assign(Object.assign({}, queryDef), { identity: this.$identity, collection: this.$collection }));
    }
    get $getCollection() {
        return this.$tree.collection(this.$collection);
    }
    get $value() {
        return this.$getCollection.get(this.$identity);
    }
}
exports.Leaf = Leaf;
