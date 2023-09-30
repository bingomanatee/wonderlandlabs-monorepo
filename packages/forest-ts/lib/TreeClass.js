"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreeClass = void 0;
const CollectionClass_1 = __importDefault(require("./CollectionClass"));
const ErrorPlus_1 = require("./ErrorPlus");
const Leaf_1 = require("./Leaf");
const rxjs_1 = require("rxjs");
const JoinIndex_1 = __importDefault(require("./JoinIndex"));
class TreeClass {
    constructor(collections, joins) {
        this.$collections = new Map();
        this.joins = new Map();
        this._indexes = new Map();
        this.updates = new rxjs_1.Subject();
        collections === null || collections === void 0 ? void 0 : collections.forEach((coll) => this.addCollection(coll));
        joins === null || joins === void 0 ? void 0 : joins.forEach((join) => this.addJoin(join));
    }
    addCollection(content) {
        var _a;
        if (!content.name) {
            throw new Error('addCollection requires name');
        }
        if (this.$collections.has(content.name)) {
            throw new Error('cannot redefine collection ' + content.name);
        }
        let values = (_a = content.values) !== null && _a !== void 0 ? _a : [];
        delete content.values;
        this.$collections.set(content.name, new CollectionClass_1.default(this, content, values));
        this.updates.next({
            action: 'add-collection',
            collection: content.name
        });
    }
    addJoin(join) {
        if (this.joins.has(join.name)) {
            throw new ErrorPlus_1.ErrorPlus('cannot redefine existing join ' + join.name, { join, tree: this });
        }
        this.joins.set(join.name, join);
        this._indexes.set(join.name, new JoinIndex_1.default(this, join.name));
    }
    do(action) {
        return action(this);
    }
    collection(name) {
        if (!this.$collections.has(name)) {
            throw new ErrorPlus_1.ErrorPlus('cannot get collection', name);
        }
        return this.$collections.get(name);
    }
    get(collection, id) {
        return this.collection(collection).get(id);
    }
    put(collection, value) {
        return this.collection(collection).put(value);
    }
    query(query) {
        return this.collection(query.collection).query(query);
    }
    fetch(query) {
        return this.collection(query.collection).fetch(query);
    }
    leaf(collection, id, query) {
        const leaf = new Leaf_1.Leaf(this, collection, id);
        if (query === null || query === void 0 ? void 0 : query.joins) {
            query.joins.forEach((join) => {
                if (!this.joins.has(join.name)) {
                    throw new ErrorPlus_1.ErrorPlus('cannot find query join', join);
                }
                if (!this._indexes.has(join.name)) {
                    throw new ErrorPlus_1.ErrorPlus('no index for join', join);
                }
                const index = this._indexes.get(join.name);
                const joinDef = this.joins.get(join.name);
                if (joinDef.to === collection) {
                    console.log('.... getting joins: to for ', collection, 'id', id);
                    leaf.$joins[join.name] = index.toLeafsFor(id, join);
                }
                else {
                    console.log('.... getting joins: from for ', collection, 'id', id);
                    leaf.$joins[join.name] = index.fromLeafsFor(id, join);
                }
            });
        }
        return leaf;
    }
}
exports.TreeClass = TreeClass;
