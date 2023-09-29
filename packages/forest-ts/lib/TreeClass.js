"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreeClass = void 0;
const CollectionClass_1 = __importDefault(require("./CollectionClass"));
const ErrorPlus_1 = require("./ErrorPlus");
const Leaf_1 = require("./Leaf");
class TreeClass {
    constructor() {
        this.$collections = new Map();
    }
    addCollection(content, values) {
        if (!content.name) {
            throw new Error('addCollection requires name');
        }
        if (this.$collections.has(content.name)) {
            throw new Error('cannot redefine collection ' + content.name);
        }
        this.$collections.set(content.name, new CollectionClass_1.default(this, content, values));
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
    leaf(collection, id) {
        return new Leaf_1.Leaf(this, collection, id);
    }
}
exports.TreeClass = TreeClass;
