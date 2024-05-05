"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Table_1 = __importDefault(require("./Table"));
class Forest {
    constructor() {
        this.log = [];
        this._publicTables = new Map();
    }
    get tables() {
        return this._publicTables;
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
}
exports.default = Forest;
