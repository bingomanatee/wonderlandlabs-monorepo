"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreeClass = void 0;
const collect_1 = require("@wonderlandlabs/collect");
const uuid_1 = require("uuid");
class TreePending {
    constructor(type, name, options) {
        this.type = type;
        this.$id = (0, uuid_1.v4)();
    }
    has(leafId) {
        var _a;
        return (_a = this.backups) === null || _a === void 0 ? void 0 : _a.has(leafId);
    }
    get(leafId) {
        var _a;
        return (_a = this.backups) === null || _a === void 0 ? void 0 : _a.get(leafId);
    }
    backup(leafId, value) {
        if (!this.backups) {
            this.backups = new Map();
        }
        this.backups.set(leafId, value);
    }
}
class TreeClass {
    constructor(root) {
        this.root = root;
        this.leaves = new Map();
        this.pending = [];
        this.addLeaf(root);
    }
    addLeaf(leaf) {
        this.leaves.set(leaf.$id, leaf);
    }
    value(leafId) {
        const pending = this.pending.find((pending) => pending.has(leafId));
        const leaf = this.leaves.get(leafId);
        if (!leaf) {
            throw new Error(`cannot identify leaf ${leafId}`);
        }
        const base = pending ? pending.get(leafId) : leaf.$subject.value;
        return composeValue(base, leaf);
    }
    get lastPending() {
        return this.pending.length ? this.pending[this.pending.length - 1] : null;
    }
    update(leafId, value) {
        const leaf = this.leaves.get(leafId);
        if (!leaf) {
            throw new Error(`write: cannot find ${leafId}`);
        }
        if (!this.pending.length) { // should probably never happen - all writes should be transactionally wrapped but...
            leaf.$subject.next(value);
        }
        else {
            const backup = this.pending.find((pending) => pending.has(leafId));
            if (!backup) {
                this.lastPending.backup(leafId, leaf.$value);
            }
            leaf.$subject.next(value);
        }
    }
}
exports.TreeClass = TreeClass;
function composeValue(value, leaf) {
    var _a;
    let con = (0, collect_1.c)(value).clone();
    if (con.family === "container" /* FormEnum.container */) {
        (_a = leaf.$children) === null || _a === void 0 ? void 0 : _a.forEach((leaf, name) => {
            con.set(name, leaf.$value);
        });
    }
    return con.value;
}
