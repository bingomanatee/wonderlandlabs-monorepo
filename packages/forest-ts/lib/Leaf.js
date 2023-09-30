"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Leaf = void 0;
const rxjs_1 = require("rxjs");
const collect_1 = require("@wonderlandlabs/collect");
class Leaf {
    constructor($tree, $collection, $identity) {
        this.$tree = $tree;
        this.$collection = $collection;
        this.$identity = $identity;
        this.$joins = {};
    }
    $subscribe(observer) {
        return this.$query({})
            .pipe((0, rxjs_1.map)(([leaf]) => leaf))
            .subscribe(observer);
    }
    $query(queryDef) {
        return this.$getCollection.query(Object.assign(Object.assign({}, queryDef), { identity: this.$identity }));
    }
    get $getCollection() {
        return this.$tree.collection(this.$collection);
    }
    get $value() {
        if (!this.$exists) {
            throw new Error('the record ' + this.$identity + ' has been removed from ' + this.$collection);
        }
        return this.$getCollection.get(this.$identity);
    }
    get $exists() {
        return this.$getCollection.has(this.$identity);
    }
    toJSON() {
        const joins = {};
        (0, collect_1.c)(this.$joins).forEach((leafs, identity) => {
            joins[identity] = leafs.map((leaf) => leaf.toJSON());
        });
        return {
            value: this.$value,
            identity: this.$identity,
            collection: this.$collection,
            joins: joins
        };
    }
}
exports.Leaf = Leaf;
