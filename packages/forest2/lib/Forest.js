"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Forest = void 0;
const Tree_1 = __importDefault(require("./Tree"));
const rxjs_1 = require("rxjs");
const lodash_isequal_1 = __importDefault(require("lodash.isequal"));
function pad(n) {
    let str = `${n}`;
    while (str.length < 3) {
        str = '0' + str;
    }
    return str;
}
class Forest {
    constructor() {
        this.trees = new Map();
        this._time = 0;
        this.depth = new rxjs_1.BehaviorSubject(new Set());
    }
    uniqueTreeName(basis = 'tree') {
        if (!this.hasTree(basis)) {
            return basis;
        }
        let number = 1;
        while (this.hasTree(`${basis}-${pad(number)}`)) {
            number += 1;
        }
        return `${basis}-${pad(number)}`;
    }
    hasTree(name) {
        return this.trees.has(name);
    }
    tree(name) {
        if (!this.hasTree(name)) {
            return undefined;
        }
        return this.trees.get(name);
    }
    addTree(name, params) {
        if (this.hasTree(name)) {
            throw new Error('cannot redefine tree ' + name);
        }
        const tree = new Tree_1.default(this, name, params);
        this.trees.set(name, tree);
        return tree;
    }
    get nextTime() {
        const time = this._time + 1;
        this._time = time;
        return time;
    }
    do(change) {
        const taskTime = this.nextTime;
        this.addDepth(taskTime);
        try {
            const result = change(this);
            this.unDepth(taskTime);
            return result;
        }
        catch (err) {
            this.trees.forEach((tree) => {
                tree.rollback(taskTime, err instanceof Error ? err.message : 'unknown error');
            });
            throw err;
        }
    }
    addDepth(taskTime) {
        const newSet = new Set(this.depth.value);
        newSet.add(taskTime);
        this.depth.next(newSet);
    }
    unDepth(taskTime) {
        const newSet2 = new Set(this.depth.value);
        newSet2.delete(taskTime);
        this.depth.next(newSet2);
    }
    /**
     * observes value changes for a tree when all 'do()' actions have completed.
     * meaning, if any errors are thrown and reset the values, no emissions are made.
     * distinct values mean that only values that are different are emitted.
     * @param name {string}
     * @returns
     */
    observe(name) {
        if (!this.hasTree(name)) {
            throw new Error('cannot observe ' + name + ': no tree by that name');
        }
        const tree = this.tree(name);
        if (!tree) {
            throw new Error('cannot observe ' + name + ': no tree by that name exists');
        } // for typescript
        return (0, rxjs_1.combineLatest)(this.depth, tree.subject).pipe((0, rxjs_1.filter)(([depth]) => {
            return depth.size === 0;
        }), (0, rxjs_1.map)(([, value]) => value), (0, rxjs_1.distinctUntilChanged)(lodash_isequal_1.default));
    }
}
exports.Forest = Forest;
