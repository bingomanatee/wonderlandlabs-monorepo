"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Table_1 = __importDefault(require("./Table"));
const ChangeSet_1 = require("./ChangeSet");
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
    addTable(name, config) {
        if (this.has(name)) {
            throw new Error('cannot add over existing table ' + name);
        }
        const table = new Table_1.default(this, name, config);
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
        const changeSet = new ChangeSet_1.ChangeSet(this, this.time, changes);
        this.log.push(changeSet);
        changeSet.perform();
        this.tables.forEach((table) => {
            if (table.currentIndex >= this.time) {
                table.validate();
            }
        });
        return true;
    }
}
exports.default = Forest;
