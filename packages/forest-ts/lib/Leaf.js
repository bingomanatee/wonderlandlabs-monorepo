"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Leaf = void 0;
const rxjs_1 = require("rxjs");
const collect_1 = require("@wonderlandlabs/collect");
const TreeClass_1 = require("./TreeClass");
const uuid_1 = require("uuid");
const lodash_isequal_1 = __importDefault(require("lodash.isequal"));
function cascadeUpdatesToChildren(leaf) {
    leaf.$subject.subscribe({
        next(value) {
            var _a;
            if (!((_a = leaf.$children) === null || _a === void 0 ? void 0 : _a.size)) {
                return;
            }
            const con = (0, collect_1.c)(value);
            // on update, write to parent and update its value;
            if (!leaf.$blockUpdateToChildren && con.family === "container" /* FormEnum.container */) {
                leaf.$children.forEach((child, key) => {
                    const fragment = con.get(key);
                    if (!(0, lodash_isequal_1.default)(child.$value, fragment)) {
                        // prevent a child/parent feedback loop
                        const block = child.$blockUpdateToParent;
                        child.$blockUpdateToParent = true;
                        child.$value = fragment;
                        child.$blockUpdateToParent = block;
                    }
                });
            }
        },
        error(err) {
        }
    });
}
function childrenToSubject(valueSubject, children) {
    if (!children) {
        return valueSubject;
    }
    const subjects = [valueSubject];
    const keys = [null];
    children.forEach((child, key) => {
        keys.push(key);
        subjects.push(child.$composedSubject);
    });
    return (0, rxjs_1.combineLatest)(subjects)
        .pipe((0, rxjs_1.map)((childValues) => {
        const con = (0, collect_1.c)(childValues[0]);
        if (con.family === "container" /* FormEnum.container */) {
            keys.forEach((key, index) => {
                if (index > 0) {
                    const value = childValues[index];
                    const key = keys[index];
                    con.set(key, value);
                }
            });
        }
        return con.value;
    }));
}
class Leaf {
    constructor(value, $options, $parent) {
        var _a;
        this.$options = $options;
        this.$parent = $parent;
        this.$blockUpdateToChildren = false;
        this.$blockUpdateToParent = false;
        this.$subject = new rxjs_1.BehaviorSubject(value);
        this.$id = (0, uuid_1.v4)();
        const com = (0, collect_1.c)(value);
        (_a = $options.fields) === null || _a === void 0 ? void 0 : _a.forEach((schema) => {
            // @TODO: make lazy?
            let childValue = undefined;
            if (com.hasKey(schema.name)) {
                childValue = com.get(schema.name);
            }
            else if ('defaultValue' in schema) {
                childValue = schema.defaultValue;
            }
            const child = new Leaf(childValue, { fields: schema.fields, name: schema.name }, this);
            this.$addChild(schema.name, child);
        });
        cascadeUpdatesToChildren(this);
        this.$tree = ($parent === null || $parent === void 0 ? void 0 : $parent.$tree) || new TreeClass_1.TreeClass(this);
    }
    get $value() {
        return this.$composedSubject.value;
    }
    get $composedSubject() {
        if (!this.$_composedSubject) {
            this.$_composedSubject = new rxjs_1.BehaviorSubject(this.$subject.value);
            this.$_childSubject.pipe((0, rxjs_1.switchMap)((children) => {
                return childrenToSubject(this.$subject, children);
            }), (0, rxjs_1.distinctUntilChanged)(lodash_isequal_1.default)).subscribe(this.$_composedSubject);
        }
        return this.$_composedSubject;
    }
    set $value(newValue) {
        this.$tree.update(this.$id, newValue);
    }
    $addChild(key, leaf) {
        if (!this.$children) {
            this.$children = new Map();
        }
        this.$children.set(key, leaf);
        this.$_childSubject.next(this.$children);
    }
    get $_childSubject() {
        if (!this.$__childSubject) {
            this.$__childSubject = new rxjs_1.BehaviorSubject(this.$children);
        }
        return this.$__childSubject;
    }
    $child(key) {
        var _a;
        return (_a = this.$children) === null || _a === void 0 ? void 0 : _a.get(key);
    }
    $complete() {
        var _a;
        this.$subject.complete();
        (_a = this.$children) === null || _a === void 0 ? void 0 : _a.forEach((child) => child.$complete());
    }
}
exports.Leaf = Leaf;
