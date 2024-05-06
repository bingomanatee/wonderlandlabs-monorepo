"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Table_1 = __importDefault(require("./Table"));
const helpers_1 = require("./helpers");
class Forest {
    constructor() {
        this.log = [];
        this._publicTables = new Map();
        this._time = 0;
    }
    get tables() {
        return this._publicTables;
    }
    get time() {
        return this._time;
    }
    addTable(name, values) {
        if (this.has(name)) {
            throw new Error('cannot add over existing table ' + name);
        }
        const table = new Table_1.default(this, name, values);
        this._publicTables.set(name, table);
        return table;
    }
    has(name) {
        return this._publicTables.has(name);
    }
    _advanceTime() {
        const nextTime = this._time + 1;
        this._time = nextTime;
    }
    /**
     * adds a pending change to the change log. Any number of actions can be combined in a single "atomic" action;
     * @TODO: validate changes, change state
     * @param changes
     */
    change(changes) {
        this._advanceTime();
        const changeSet = new ChangeSet(this, this.time, changes);
        this.log.push(changeSet);
        changeSet.perform();
        return true;
    }
}
exports.default = Forest;
class ChangeSet {
    constructor(forest, time, changes) {
        this.forest = forest;
        this.time = time;
        this.changes = changes;
        this._changedTables = new Map();
    }
    perform() {
        this.changes.forEach((change) => {
            if ((0, helpers_1.isTableChangeBase)(change)) {
                const table = this.forest.tables.get(change.table);
                table.atTime(this.time);
                table.change(change);
            }
            if ((0, helpers_1.isForestChange)(change)) {
                throw new Error('not implemented');
            }
        });
    }
}
