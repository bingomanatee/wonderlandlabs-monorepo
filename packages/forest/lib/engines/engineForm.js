"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.engineMap = void 0;
const constants_1 = require("../constants");
const types_1 = require("../types");
const Engine_1 = __importDefault(require("./Engine"));
const engineTypes_1 = require("./engineTypes");
const Form_types_1 = __importStar(require("./Form.types"));
function isKeyVal(a) {
    return (0, types_1.isObj)(a) && "key" in a && "val" in a;
}
function setActionFactory(engine) {
    const action = {
        name: "set",
        cacheable: true,
        mutator: function (branch, args) {
            const [name, val, params] = args;
            if (!branch.prev)
                throw new Error("set must have prev");
            const form = branch.prev.value;
            if (!form.fields.has(name)) {
                // generate new field
                if ((0, Form_types_1.isFieldPairIF)(val) || (0, Form_types_1.isFieldValue)(val)) {
                    form.fields.set(name, new Form_types_1.default({ tree: branch.tree, value: val, name, params }));
                }
                else if ((0, Form_types_1.isFieldIF)(val)) {
                    form.fields.set(name, val);
                }
                else {
                    throw new Error("bad set value");
                }
            }
            else {
                // mpdify existing field
                const oldField = form.fields.get(name);
                const newField = new Form_types_1.default(oldField);
                if ((0, Form_types_1.isFieldPairIF)(val) || (0, Form_types_1.isFieldValue)(val)) {
                    newField.value = val;
                    form.fields.set(name, newField);
                }
                else {
                    throw new Error("bad set value");
                }
                if (params) {
                    if (newField.params) {
                        newField.params = { ...newField.params, params };
                    }
                    else {
                        newField.params = params;
                    }
                }
            }
            form.fields = new Map(form.fields);
            return form;
        },
    };
    return action;
}
function deleteActionFactory(engine) {
    const action = {
        name: "delete",
        cacheable: true,
        mutator: function (branch, keys) {
            const map = branch.prev
                ? new Map(branch.prev.value)
                : new Map();
            const [first] = keys;
            if ((0, engineTypes_1.isDel)(first)) {
                if ((0, engineTypes_1.isSingleDel)(first)) {
                    map.delete(first.delKey);
                }
                if ((0, engineTypes_1.isMultiDel)(first)) {
                    for (const key of first.delKeys) {
                        map.delete(key);
                    }
                }
            }
            else {
                for (const key of keys) {
                    map.delete(key);
                }
            }
            return map;
        },
    };
    return action;
}
function patchEngineFactory(engine) {
    const action = {
        name: "patch",
        cacheable: true,
        mutator(branch, args) {
            const map = branch.prev
                ? new Map(branch.prev.value)
                : new Map();
            const [manifest] = args;
            if (!(Array.isArray(manifest) || manifest instanceof Map)) {
                throw new Error("bad patch argument");
            }
            const next = Array.isArray(manifest) ? new Map(manifest) : manifest;
            next.forEach((val, key) => {
                if (val === constants_1.DELETED) {
                    map.delete(key);
                }
                else {
                    map.set(key, val);
                }
            });
            return map;
        },
    };
    return action;
}
function replaceActionFactory(engine) {
    const action = {
        name: "replace",
        cacheable: true,
        mutator(branch, args) {
            const [seed] = args;
            return new Map(seed);
        },
    };
    return action;
}
exports.engineMap = {
    name: "map",
    factory(tree) {
        const engine = new Engine_1.default("map", {
            cacheable: constants_1.CACHE_TOP_ONLY,
            validator(value) {
                if (!(0, Form_types_1.isForm)(value)) {
                    throw new Error("badly formed form");
                }
                return false;
            },
        });
        engine.addAction(setActionFactory(engine));
        engine.addAction(deleteActionFactory(engine));
        engine.addAction(patchEngineFactory(engine));
        engine.addAction(replaceActionFactory(engine));
        return engine;
    },
};
