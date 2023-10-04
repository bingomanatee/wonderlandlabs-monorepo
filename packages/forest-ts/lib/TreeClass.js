"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreeClass = void 0;
const collect_1 = require("@wonderlandlabs/collect");
const walrus_1 = require("@wonderlandlabs/walrus");
const lodash_1 = require("lodash");
const types_1 = require("./types");
const CollectionClass_1 = __importDefault(require("./CollectionClass"));
const ErrorPlus_1 = require("./ErrorPlus");
const Leaf_1 = require("./Leaf");
const rxjs_1 = require("rxjs");
const JoinIndex_1 = __importDefault(require("./JoinIndex"));
function prefix(item) {
    if (typeof item === 'string') {
        return prefix([item]);
    }
    return item.map((str) => {
        return walrus_1.text.addBefore(str, '$value.');
    });
}
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
        let records = (_a = content.records) !== null && _a !== void 0 ? _a : [];
        delete content.records;
        this.$collections.set(content.name, new CollectionClass_1.default(this, content, records));
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
    findMatchingJoins(collection, coll2) {
        return (0, collect_1.c)(this.joins).getReduce((list, join) => {
            if (join.from === collection && join.to === coll2) {
                list.push(join);
            }
            else if (join.to === collection && join.from === coll2) {
                list.push(join);
            }
            return list;
        }, []);
    }
    leaf(collection, id, query) {
        const leaf = new Leaf_1.Leaf(this, collection, id);
        if (query === null || query === void 0 ? void 0 : query.joins) {
            query.joins.forEach((join) => {
                let joinDef;
                if ((0, types_1.isQueryNamedDefJoin)(join)) {
                    if (!this.joins.has(join.name)) {
                        throw new ErrorPlus_1.ErrorPlus('cannot find query join ' + join.name, join);
                    }
                    if (!this._indexes.has(join.name)) {
                        throw new ErrorPlus_1.ErrorPlus('no index for join ' + join.name, join);
                    }
                    joinDef = this.joins.get(join.name);
                }
                else if ((0, types_1.isQueryCollectionDefJoin)(join)) {
                    const matches = this.findMatchingJoins(collection, join.collection);
                    switch (matches.length) {
                        case 0:
                            throw new Error(`cannot find amy joins between ${collection} and ${join.collection}`);
                            break;
                        case 1:
                            joinDef = matches[0];
                            break;
                        default:
                            throw new ErrorPlus_1.ErrorPlus(`there are two or more joins between ${collection} and ${join.collection} -- you must name the specific join you want to use`, query);
                    }
                }
                else {
                    throw new ErrorPlus_1.ErrorPlus('join is not proper', join);
                }
                let index;
                try {
                    index = this._indexes.get(joinDef.name);
                }
                catch (err) {
                    console.log('---- error getting index for ', joinDef, 'from join', join);
                    throw err;
                }
                if (joinDef.to === collection) {
                    leaf.$joins[joinDef.name] = index.toLeafsFor(id, join);
                }
                else {
                    leaf.$joins[joinDef.name] = index.fromLeafsFor(id, join);
                }
                if (join.sorter) {
                    console.log('sorting ', leaf.$joins[joinDef.name], 'with', join.sorter);
                    if (typeof join.sorter === 'function') {
                        leaf.$joins[joinDef.name] = leaf.$joins[joinDef.name].sort(join.sorter);
                    }
                    else {
                        leaf.$joins[joinDef.name] = (0, lodash_1.sortBy)(leaf.$joins[joinDef.name], prefix(join.sorter));
                    }
                }
            });
        }
        return leaf;
    }
}
exports.TreeClass = TreeClass;
