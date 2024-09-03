"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Branch = void 0;
const types_shared_1 = require("./types.shared");
class Branch {
    constructor(tree, change) {
        this.tree = tree;
        this.change = change;
        this.time = tree.forest.nextTime;
    }
    get next() {
        return this._next;
    }
    set next(value) {
        if (this === value) {
            throw new Error('cannot self recurse');
        }
        if (value && (this.prev === value)) {
            throw new Error('cannot self recurse loop');
        }
        this._next = value;
    }
    get prev() {
        return this._prev;
    }
    set prev(value) {
        if (this.prev === value) {
            throw new Error('cannot self-recurse');
        }
        if (value && (this.next === value)) {
            throw new Error('cannot self recurse loop');
        }
        this._prev = value;
    }
    add(change) {
        const nextBranch = new Branch(this.tree, change);
        this.link(this, nextBranch);
        return nextBranch;
    }
    get value() {
        if ((0, types_shared_1.isMutator)(this.change)) {
            return this.change.next(this.prev, this.change.seed);
        }
        return this.change.next;
    }
    linkTo(branch) {
        return this.link(this, branch);
    }
    link(branchA, branchB) {
        if (branchA) {
            branchA.next = branchB;
        }
        if (branchB) {
            branchB.prev = branchA;
        }
    }
    toString() {
        return `branch ${this.time} of tree {${this.tree.name ?? '(anon)'}} - value = ${this.value} next=${this.next ? this.next.time : '<null>'} prev=${this.prev ? this.prev.time : '<null>'}`;
    }
}
exports.Branch = Branch;
