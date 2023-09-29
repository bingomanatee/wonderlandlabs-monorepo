"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ErrorPlus_1 = require("./ErrorPlus");
const walrus_1 = require("@wonderlandlabs/walrus");
const rxjs_1 = require("rxjs");
const lodash_1 = require("lodash");
const constants_1 = require("./constants");
function compareMaps(map1, map2, query) {
    if (query.identity) {
        const firstValue = map1.get(query.identity);
        const secondValue = map2.get(query.identity);
        return (0, lodash_1.isEqual)(firstValue, secondValue);
    }
    if (map1.size !== map2.size) {
        return false;
    }
    return Array.from(map1.keys()).every((key) => {
        let v1 = map1.get(key);
        let v2 = map2.get(key);
        if (v1 === v2) {
            return true;
        }
        return (0, lodash_1.isEqual)(v1, v2);
    });
}
class CollectionClass {
    constructor(tree, config, values) {
        this.tree = tree;
        this.config = config;
        this.values = new Map();
        this._validateConfig();
        this.subject = new rxjs_1.BehaviorSubject(this.values);
        values === null || values === void 0 ? void 0 : values.forEach((value) => {
            this.setValue(value);
        });
    }
    get fieldMap() {
        if (!this._fieldMap) {
            this._fieldMap = this.config.fields.reduce((m, field) => {
                m.set(field.name, field);
                return m;
            }, new Map());
        }
        return this._fieldMap;
    }
    _validateConfig() {
        if (!this.config.identity)
            throw new ErrorPlus_1.ErrorPlus('colletion config missing identity', this.config);
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
        for (let def of this.config.fields) {
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
        }
    }
    identityOf(value) {
        if (this.config.identity === constants_1.SINGLE) {
            return constants_1.SINGLE;
        }
        if (typeof this.config.identity === 'string') {
            return value[this.config.identity];
        }
        if (typeof this.config.identity === 'function') {
            return this.config.identity(value, this);
        }
    }
    /**
     * this is an "inner put" that (will be) triggering transactional backups
     */
    setValue(value) {
        this.validate(value);
        const next = new Map(this.values);
        const id = this.identityOf(value);
        next.set(id, value);
        this.values = next;
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
            console.warn(`attempt to get a value for ${id} that is not in ${this.name}`, this, id);
        }
        return this.values.get(id);
    }
    query(query) {
        if (query.collection && (query.collection !== this.name)) {
            throw new ErrorPlus_1.ErrorPlus(`cannot query ${this.name}with query for ${query.collection}`, query);
        }
        const cQuery = Object.assign({ collection: this.name }, query);
        if (cQuery.identity) {
            return this.subject
                .pipe((0, rxjs_1.takeWhile)((values) => values.has(query.identity)), (0, rxjs_1.distinctUntilChanged)((map1, map2) => compareMaps(map1, map2, cQuery)), (0, rxjs_1.map)(() => ([this.tree.leaf(this.name, query.identity)])));
        }
        return this.subject.pipe((0, rxjs_1.distinctUntilChanged)((map1, map2) => compareMaps(map1, map2, cQuery)), (0, rxjs_1.map)((values) => (Array.from(values.keys())
            .map((id) => {
            return this.tree.leaf(this.name, id);
        }))));
    }
    fetch(query) {
        let out;
        let sub = this.query(query)
            .subscribe((value) => {
            out = value;
            sub.unsubscribe();
        });
        sub === null || sub === void 0 ? void 0 : sub.unsubscribe();
        return out;
    }
}
exports.default = CollectionClass;
