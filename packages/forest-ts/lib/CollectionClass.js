"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ErrorPlus_1 = require("./ErrorPlus");
const walrus_1 = require("@wonderlandlabs/walrus");
const rxjs_1 = require("rxjs");
const collect_1 = require("@wonderlandlabs/collect");
const utils_1 = require("./utils");
class CollectionClass {
    constructor(tree, config, records) {
        this.tree = tree;
        this.config = config;
        this._validateConfig();
        const map = new Map();
        records === null || records === void 0 ? void 0 : records.forEach((value) => {
            this.validate(value);
            const id = this.identityOf(value);
            map.set(id, value);
        });
        this.subject = new rxjs_1.BehaviorSubject(map);
        this.subject.subscribe(() => {
            this.tree.updates.next({
                action: 'update-collection',
                collection: this.name,
            });
        });
    }
    get values() {
        return this.subject.value;
    }
    get fieldMap() {
        if (!this._fieldMap) {
            if (Array.isArray(this.config.fields)) {
                this._fieldMap = this.config.fields.reduce((m, field) => {
                    m.set(field.name, field);
                    return m;
                }, new Map());
            }
            else {
                this._fieldMap = new Map();
                (0, collect_1.c)(this.config.fields).forEach((field, name) => {
                    if (typeof field !== 'object') {
                        field = { type: field };
                    }
                    this._fieldMap.set(name, Object.assign(Object.assign({}, field), { name }));
                });
            }
        }
        return this._fieldMap;
    }
    _validateConfig() {
        if (!this.config.identity) {
            throw new ErrorPlus_1.ErrorPlus('colletion config missing identity', this.config);
        }
        switch (typeof this.config.identity) {
            case 'string':
                const idDef = this.fieldMap.get(this.config.identity);
                if (!idDef) {
                    throw new ErrorPlus_1.ErrorPlus(`collection config identity must include identity field ${this.config.identity}`, this.config);
                }
                if (idDef.optional) {
                    throw new ErrorPlus_1.ErrorPlus('collection identity field cannot be empty', this.config);
                }
                break;
            case 'function':
                break;
            default:
                throw new ErrorPlus_1.ErrorPlus('identity must be a string or function', { config: this.config });
        }
    }
    get name() {
        return this.config.name;
    }
    validate(value) {
        this.fieldMap.forEach((def) => {
            if (def.name in value) {
                const fieldValue = value[def.name];
                const fvType = walrus_1.type.describe(fieldValue, true);
                if (def.type) {
                    if (Array.isArray(def.type)) {
                        if (!def.type.includes(fvType)) {
                            throw new ErrorPlus_1.ErrorPlus(`field ${def.name} does not match any allowed type`, { def, value, collection: this.name });
                        }
                    }
                    else {
                        if (fvType !== def.type) {
                            throw new ErrorPlus_1.ErrorPlus('field does not match allowed type', {
                                type: def.type,
                                field: def.name,
                                value, collection: this.name
                            });
                        }
                    }
                }
                if (def.validator) {
                    const error = def.validator(fieldValue, this);
                    if (error) {
                        throw new ErrorPlus_1.ErrorPlus(`failed validation filter for ${def.name}`, {
                            field: def.name,
                            value,
                            collection: this.name
                        });
                    }
                }
            }
            else {
                if (!def.optional) {
                    throw new ErrorPlus_1.ErrorPlus(`validation error: ${this.name} record missing required field ${def.name}`, { data: value, collection: this, field: def.name });
                }
            }
        });
    }
    identityOf(value) {
        if (typeof this.config.identity === 'string') {
            return value[this.config.identity];
        }
        if (typeof this.config.identity === 'function') {
            return this.config.identity(value, this);
        }
        throw new ErrorPlus_1.ErrorPlus('config identity is not valid', { config: this.config, collection: this });
    }
    /**
     * this is an "inner put" that (will be) triggering transactional backups
     */
    setValue(value) {
        this.validate(value);
        const next = new Map(this.values);
        const id = this.identityOf(value);
        next.set(id, value);
        this.subject.next(next);
        return id;
    }
    put(value) {
        return this.tree.do(() => {
            return this.setValue(value);
        });
    }
    get(id) {
        if (!this.values.has(id)) {
            // console.warn(`attempt to get a value for ${id} that is not in ${this.name}`, this, id);
        }
        return this.values.get(id);
    }
    query(query) {
        if (query.collection && (query.collection !== this.name)) {
            throw new ErrorPlus_1.ErrorPlus(`cannot query ${this.name}with query for ${query.collection}`, query);
        }
        const self = this;
        const cQuery = Object.assign({ collection: this.name }, query);
        if (cQuery.identity) {
            return this.subject
                .pipe((0, rxjs_1.takeWhile)((values) => values.has(query.identity)), (0, rxjs_1.distinctUntilChanged)((map1, map2) => (0, utils_1.compareMaps)(map1, map2, cQuery)), (0, rxjs_1.map)(() => self._fetch(cQuery)));
        }
        return this.subject.pipe((0, rxjs_1.distinctUntilChanged)((map1, map2) => (0, utils_1.compareMaps)(map1, map2, cQuery)), (0, rxjs_1.map)(() => this._fetch(cQuery)));
    }
    _fetch(query) {
        const localQuery = Object.assign({ collection: this.name }, query);
        if (query.identity) {
            if (!this.has(query.identity)) {
                return [];
            }
            return [this.tree.leaf(this.name, query.identity, localQuery)];
        }
        return Array.from(this.values.keys()).map((key) => this.tree.leaf(this.name, key, localQuery));
    }
    has(identity) {
        return this.values.has(identity);
    }
    fetch(query) {
        if (query.collection && (query.collection !== this.name)) {
            throw new ErrorPlus_1.ErrorPlus(`cannot query ${this.name}with query for ${query.collection}`, query);
        }
        return this._fetch(query);
    }
}
exports.default = CollectionClass;
