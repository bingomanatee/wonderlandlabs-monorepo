"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Collection = void 0;
const Forest_1 = require("../Forest");
class Collection {
    name;
    params;
    constructor(name, params, forest) {
        this.name = name;
        this.params = params;
        this.forest = forest ?? new Forest_1.Forest();
        if (this.forest.hasTree(name)) {
            if (params?.reuseTree) {
                if (params.validator || params.initial) {
                    throw new Error('reused tree cannot have validator/initial value - tree exists already and cannot be redefined');
                }
                // otherwise, allow Collection to exist
                return;
            }
            else {
                throw new Error('cannot create collection - tree ' + name + ' exists');
            }
        }
        else {
            if (params) {
                const { actions, ...rest } = params;
                this.forest.addTree(name, rest);
            }
            else {
                this.forest.addTree(name);
            }
        }
    }
    get value() {
        return this.tree.value;
    }
    act(name, seed) {
        const fn = this.params?.actions?.get(name);
        if (!fn) {
            throw new Error('cannot perform action ' + name + ': not in colletion');
        }
        const collection = this;
        return this.forest.do(() => fn(collection, seed));
    }
    next(next, name) {
        this.tree.next(next, name);
        return this;
    }
    mutate(mutator, name, seed) {
        const change = {
            name,
            seed,
            mutator,
        };
        this.tree.grow(change);
        return this;
    }
    get subject() {
        return this.tree.subject;
    }
    subscribe(observer) {
        return this.subject.subscribe(observer);
    }
    forest;
    get tree() {
        const tree = this.forest.tree(this.name);
        if (!tree) {
            throw new Error('cannot find tree ' + this.name);
        }
        return tree;
    }
}
exports.Collection = Collection;
