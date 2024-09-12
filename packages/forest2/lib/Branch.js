"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Branch = void 0;
const types_shared_1 = require("./types/types.shared");
const types_guards_1 = require("./types/types.guards");
const isCacheable_1 = require("./isCacheable");
class Branch {
    constructor(tree, change) {
        this.tree = tree;
        this.change = change;
        this._hasBeenCached = null;
        if (!tree || !change)
            throw new Error("unparameterized branch");
        this.time = change && "time" in change ? change.time : tree.forest.nextTime;
    }
    get cause() {
        return this.change.name;
    }
    get next() {
        return this._next;
    }
    set next(value) {
        if (this === value) {
            throw new Error("next: cannot self recurse");
        }
        if (value && this.prev === value) {
            throw new Error("next: prev: cannot self recurse loop");
        }
        this._next = value;
    }
    get prev() {
        return this._prev;
    }
    set prev(value) {
        if (this === value) {
            throw new Error("prev: cannot self-recurse");
        }
        if (value && this.next === value) {
            throw new Error("prev:next:cannot self recurse loop");
        }
        this._prev = value;
    }
    /**
     *
     * executes a "grow." note, it is not encapsulated by transaction
     *  and does not trigger watchers,
     *  so it should not be called directly by application code.
     */
    add(change) {
        if (this.next) {
            throw new Error("can only add at the end of a chain");
        }
        const nextBranch = new Branch(this.tree, change);
        Branch.link(this, nextBranch);
        return nextBranch;
    }
    _cacheValue(v) {
        this._cached = v;
        this._hasBeenCached = true;
    }
    _resetCache() {
        // clear out any non-top caches; use cached value one last time.
        const out = this._cached;
        delete this._cached;
        this._hasBeenCached = null;
        return out;
    }
    clone(toAssert) {
        const value = this.tree.params?.serializer
            ? this.tree.params.serializer({
                branch: this,
                tree: this.tree,
                context: types_shared_1.ValueProviderContext.truncation,
                value: this.value
            })
            : this.value;
        const change = toAssert
            ? { assert: value, name: "cloned", time: this.time }
            : this.change;
        const out = new Branch(this.tree, change);
        out.prev = this.prev;
        out.next = this.next;
        return out;
    }
    get value() {
        if (!this.change)
            throw new Error("cannot get value of branch without change");
        if (this._hasBeenCached === true) {
            if (this !== this.tree.top) {
                return this._resetCache();
            }
            return this._cached;
        }
        if ((0, types_guards_1.isAssert)(this.change)) {
            return this.change.assert;
        }
        if ((0, types_guards_1.isMutator)(this.change)) {
            const value = this.change.mutator({
                branch: this.prev,
                seed: this.change.seed,
                context: types_shared_1.ValueProviderContext.mutation,
                tree: this.tree,
                value: this.prev?.value
            });
            if (this !== this.tree.top) {
                // to reduce the number of unneede caches, don't cache any branches that are not currently top.
                return value;
            }
            if (this._hasBeenCached === false) {
                // stop trying to see if its cacheable or not, return directly
                return value;
            }
            if (this.tree.isUncacheable) {
                this._hasBeenCached = false; // stop trying to see if its cacheable or not.
                return value;
            }
            if ((0, isCacheable_1.isCacheable)(value)) {
                this._cacheValue(value);
            }
            else {
                this._hasBeenCached = false;
            }
            return value;
        }
        console.warn("impossible changeType", this.change, (0, types_guards_1.isAssert)(this.change), (0, types_guards_1.isMutator)(this.change), this);
        throw new Error("impossible");
    }
    linkTo(branch) {
        return Branch.link(this, branch);
    }
    static link(branchA, branchB) {
        if (branchA) {
            branchA.next = branchB;
        }
        if (branchB) {
            branchB.prev = branchA;
        }
    }
    static unlink(branchA, branchB) {
        if (branchA) {
            branchA.next = undefined;
        }
        if (branchB) {
            branchB.prev = undefined;
        }
    }
    toString() {
        return `branch ${this.time} of tree {${this.tree.name ?? "(anon)"}} - value = ${this.value} next=${this.next ? this.next.time : "<null>"} prev=${this.prev ? this.prev.time : "<null>"}`;
    }
    destroy() {
        this.next = null;
        this.prev = null;
        this._cacheValue = undefined;
        // @ts-expect-error
        this.tree = undefined;
        // @ts-expect-error
        this.change = undefined;
    }
}
exports.Branch = Branch;
