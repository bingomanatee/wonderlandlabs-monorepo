"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
const collect_1 = require("@wonderlandlabs/collect");
const helpers_1 = require("./helpers");
class Table {
    constructor(forest, name, config) {
        this.forest = forest;
        this.name = name;
        this.config = config;
        this.stack = [];
        this._dirtyIDs = [];
        if (config?.values) {
            this.stack[forest.time] = config.values;
        }
        else {
            this.stack[forest.time] = new Map();
        }
    }
    /**
     * clones data to a time index
     * @param index
     */
    atTime(index) {
        if (this.stack[index]) {
            throw new Error('Cannot redefine stack ' + index + ' of table ' + this.name);
        }
        this.stack[index] = new Map(this.current);
    }
    /**
     * alter the stack head collection.
     * THIS SHOULD ONLY BE DONE BY FOREST CLASSES - NEVER FROM THE OUTSIDE.
     * @param {TableChange} change
     */
    change(change) {
        if ((0, helpers_1.isTableChangeField)(change)) {
            this._changeField(change);
            return;
        }
        if ((0, helpers_1.isTableChangeValue)(change)) {
            this._changeRecord(change);
            return;
        }
        console.error('bad TableChange for table', this, ':', change);
        throw new Error('cannot interpret TableChange');
    }
    _changeRecord(change) {
        switch (change.action) {
            case types_1.CrudEnum.CRUD_ADD:
                if (this.current.has(change.id)) {
                    throw new Error(`cannot override existing record ${String(change.id)} with CRUD_ADD`);
                }
                this._changeValue(change.id, change.value);
                break;
            case types_1.CrudEnum.CRUD_UPSERT:
                this._changeValue(change.id, change.value);
                break;
            case types_1.CrudEnum.CRUD_CHANGE:
                if (!this.current.has(change.id)) {
                    throw new Error('cannot change a record that is not in the record with "CRUD_CHANGE" method');
                }
                this._changeValue(change.id, change.value);
                break;
            case types_1.CrudEnum.CRUD_DELETE:
                this.current.delete(change.id);
                break;
            default:
                throw new Error('cannot process change action ' + change.action);
        }
    }
    validate() {
        if (!this.config?.validator) {
            return;
        }
        if (this._dirtyIDs[this.forest.time]) {
            this._dirtyIDs[this.forest.time].forEach((id) => {
                this._validateRecord(id);
            });
        }
    }
    _validateRecord(id) {
        if (this.has(id) && this.config?.validator) {
            this.config.validator(this.get(id), id, this);
        }
    }
    _changeValue(id, value) {
        if (!this._dirtyIDs[this.forest.time]) {
            this._dirtyIDs[this.forest.time] = new Set([id]);
        }
        else {
            this._dirtyIDs[this.forest.time].add(id);
        }
        this.current.set(id, value);
    }
    _changeField(change) {
        if (!this.has(change.id)) {
            throw new Error(`cannot change value: no id ${String(change.id)} in ${this.name}`);
        }
        const record = this.get(change.id);
        const coll = (0, collect_1.c)(record).clone();
        switch (change.action) {
            case types_1.CrudEnum.CRUD_ADD:
                if (coll.hasKey(change.field)) {
                    throw new Error('cannot change a field that is not in the record with "CRUD_CHANGE" method');
                }
                coll.set(change.field, change.value);
                break;
            case types_1.CrudEnum.CRUD_UPSERT:
                coll.set(change.field, change.value);
                break;
            case types_1.CrudEnum.CRUD_CHANGE:
                if (!coll.hasKey(change.field)) {
                    throw new Error('cannot change a field that is not in the record with "CRUD_CHANGE" method');
                }
                coll.set(change.field, change.value);
                break;
            case types_1.CrudEnum.CRUD_DELETE:
                if (coll.hasKey(change.field)) {
                    coll.deleteKey(change.field); // not having it in the first place is not an error
                }
                break;
            default:
                throw new Error('cannot process change action ' + change.action);
        }
        this._changeRecord({
            value: coll.value,
            table: this.name,
            id: change.id,
            action: types_1.CrudEnum.CRUD_CHANGE,
        });
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
    has(id) {
        return this.current.has(id);
    }
    /**
     * updates the entire record for a single ID.
     * this is an external command sugar for a TableChangeField command
     * @param id
     * @param value
     */
    set(id, value) {
        this.forest.change([
            {
                table: this.name,
                id,
                value,
                action: this.has(id) ? types_1.CrudEnum.CRUD_CHANGE : types_1.CrudEnum.CRUD_ADD,
            },
        ]);
    }
    get(id) {
        if (!this.has(id)) {
            throw new Error(`Cannot get undefined key value for ${String(id)}`);
        }
        return this.current.get(id);
    }
}
exports.default = Table;
