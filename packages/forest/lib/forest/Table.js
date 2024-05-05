"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Table {
    constructor(forest, name, values) {
        this.forest = forest;
        this.name = name;
        this.stack = [];
        this.stack.push(values);
    }
    get current() {
        if (!this.stack.length) {
            throw new Error('table cannot be empty');
        }
        return this.stack[this.stack.length - 1];
    }
    get currentIndex() {
        return this.stack.length - 1;
    }
    delete(key) {
        if (!this.has(key)) {
            return false;
        }
        const next = new Map(this.current);
        next.delete(key);
        this.stack.push(next);
        return true;
    }
    has(key) {
        return false;
    }
    set(key, value) {
        const next = new Map(this.current);
        next.set(key, value);
        this.stack.push(next);
    }
    get(key) {
        if (!this.has(key)) {
            throw new Error('Cannot get undefined key value for ' + key);
        }
        return this.current.get(key);
    }
}
exports.default = Table;
