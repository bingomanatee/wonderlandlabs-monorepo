"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Forest = void 0;
const Tree_1 = __importDefault(require("./Tree"));
const rxjs_1 = require("rxjs");
const lodash_isequal_1 = __importDefault(require("lodash.isequal"));
const utils_1 = require("./utils");
function pad(n) {
    let str = `${n}`;
    while (str.length < 3) {
        str = "0" + str;
    }
    return str;
}
class Forest {
    constructor() {
        this.trees = new Map();
        this._time = 0;
        this.activeTaskSubject = new rxjs_1.BehaviorSubject(new Set());
        // #endregion
    }
    uniqueTreeName(basis = "tree") {
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
    get treeNames() {
        return Array.from(this.trees.keys());
    }
    addTree(name, params) {
        if (this.hasTree(name)) {
            throw new Error("cannot redefine tree " + name);
        }
        const tree = new Tree_1.default(this, name, params);
        this.trees.set(name, tree);
        return tree;
    }
    get time() {
        return this._time;
    }
    get nextTime() {
        this._time = this._time + 1;
        return this.time;
    }
    get activeTasks() {
        if (!this.activeTaskSubject.value.size)
            return [];
        return Array.from(this.activeTaskSubject.value.values());
    }
    do(change) {
        const taskTime = this.nextTime;
        this.addActiveTask(taskTime);
        try {
            const result = change(this);
            this.removeActiveTask(taskTime);
            return result;
        }
        catch (err) {
            this.removeActiveTask(taskTime);
            this.trees.forEach((tree) => {
                tree.rollback(taskTime, err instanceof Error ? err.message : "unknown error");
            });
            throw err;
        }
    }
    addActiveTask(taskTime) {
        const newSet = new Set(this.activeTaskSubject.value);
        newSet.add(taskTime);
        this.activeTaskSubject.next(newSet);
    }
    removeActiveTask(taskTime) {
        const newSet2 = new Set(this.activeTaskSubject.value);
        newSet2.delete(taskTime);
        this.activeTaskSubject.next(newSet2);
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
            throw new Error("cannot observe " + name + ": no tree by that name");
        }
        const tree = this.tree(name);
        if (!tree) {
            throw new Error("cannot observe " + name + ": no tree by that name exists");
        } // for typescript
        return (0, rxjs_1.combineLatest)([this.activeTaskSubject, tree.subject]).pipe((0, rxjs_1.filter)(([depth]) => {
            return depth.size === 0;
        }), (0, rxjs_1.map)(([, value]) => value), (0, rxjs_1.distinctUntilChanged)(lodash_isequal_1.default));
    }
    addNote(message, params) {
        if (!this._notes) {
            this._notes = new Map();
        }
        utils_1.NotableHelper.addNote(this.time, this._notes, message, params);
    }
    hasNoteAt(time) {
        return this._notes?.has(time) || false;
    }
    notes(fromTime, toTime = 0) {
        if (!this._notes) {
            return [];
        }
        return utils_1.NotableHelper.notes(this._notes, fromTime, toTime);
    }
}
exports.Forest = Forest;
