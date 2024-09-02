"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Collection = void 0;
const Forest_1 = require("../Forest");
class Collection {
    constructor(name, params, forest) {
        this.name = name;
        this.params = params;
        this.forest = forest ?? new Forest_1.Forest();
        if (this.forest.hasTree(name)) {
            throw new Error('cannot create collection - tree ' + name + ' exists');
        }
        this.forest.addTree(name, {
            initial: params?.initial,
            validator: params?.validator,
        });
    }
    get value() {
        return this.tree.value;
    }
    next(next) {
        this.tree.grow({ next });
        return this;
    }
    mutate(next, seed) {
        this.tree.grow({ next, seed }); // untested
        return this;
    }
    get subject() {
        return this.tree.subject;
    }
    subscribe(observer) {
        return this.subject.subscribe(observer);
    }
    get tree() {
        const tree = this.forest.tree(this.name);
        if (!tree) {
            throw new Error('cannot find tree ' + this.name);
        }
        return tree;
    }
}
exports.Collection = Collection;
